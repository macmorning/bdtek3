<template>
  <v-container class="scanner-container">
    <div class="scanner-view">
      <video ref="video" class="scanner-video" muted playsinline></video>
      <!-- Canvas overlay pour dessiner les rectangles de detection -->
      <canvas ref="overlay" class="scanner-overlay-canvas"></canvas>
      <div class="scanner-overlay">
        <div class="scanner-status">{{ status }}</div>
        <div v-if="engine" class="scanner-engine">Moteur : {{ engine }}</div>
        <div v-if="error" class="scanner-error">{{ error }}</div>
      </div>
    </div>
  </v-container>
</template>

<script>
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType
} from '@zxing/library'

export default {
  name: 'VueBarcode',
  props: {
    onDetected: {
      type: Function,
      required: false
    },
    onError: {
      type: Function,
      required: false
    }
  },
  data () {
    return {
      status: 'Initialisation du scanner...',
      engine: '',
      error: '',
      codeReader: null,
      stream: null,
      nativeDetector: null,
      nativeLoopId: null,
      running: false
    }
  },
  methods: {
    async startScanner () {
      this.running = true
      // 1) Tenter l'API native BarcodeDetector (rapide, decodeur OS)
      if (await this.tryNativeDetector()) {
        // Si un arret a ete demande pendant l'init async, couper immediatement
        if (!this.running) this.stopScanner()
        return
      }
      // 2) Fallback ZXing JS
      await this.startZxing()
      // Idem : si arret demande pendant l'init ZXing, couper
      if (!this.running) this.stopScanner()
    },

    // -----------------------------------------------------------------
    // API native BarcodeDetector (Chrome/Edge/Android)
    // -----------------------------------------------------------------
    async tryNativeDetector () {
      if (!('BarcodeDetector' in window)) {
        return false
      }
      try {
        const supported = await window.BarcodeDetector.getSupportedFormats()
        const wanted = ['ean_13', 'ean_8', 'upc_a'].filter(f => supported.includes(f))
        if (wanted.length === 0) {
          return false
        }
        this.nativeDetector = new window.BarcodeDetector({ formats: wanted })

        this.stream = await this.getCameraStream()
        const video = this.$refs.video
        video.srcObject = this.stream
        await video.play()

        this.engine = 'natif (BarcodeDetector)'
        this.status = 'Camera active, lecture en cours...'
        this.syncOverlaySize()
        this.nativeLoop()
        return true
      } catch (err) {
        console.warn('BarcodeDetector natif indisponible, fallback ZXing', err)
        this.cleanupNative()
        return false
      }
    },

    async nativeLoop () {
      if (!this.running || !this.nativeDetector) return
      const video = this.$refs.video
      try {
        const codes = await this.nativeDetector.detect(video)
        if (codes && codes.length > 0) {
          this.drawBoxes(codes.map(c => c.boundingBox))
          this.emitDetected({ getText: () => codes[0].rawValue })
        } else {
          this.clearOverlay()
        }
      } catch (err) {
        // Erreurs transitoires de detection : ignorer
      }
      if (this.running) {
        this.nativeLoopId = requestAnimationFrame(() => this.nativeLoop())
      }
    },

    // -----------------------------------------------------------------
    // Fallback ZXing JS
    // -----------------------------------------------------------------
    async startZxing () {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      this.codeReader = new BrowserMultiFormatReader(hints)

      try {
        const devices = await this.codeReader.listVideoInputDevices()
        if (!devices || devices.length === 0) {
          this.error = 'Aucune camera detectee.'
          this.status = 'Scanner indisponible'
          if (typeof this.onError === 'function') {
            this.onError(new Error('Aucune camera detectee.'))
          }
          return
        }

        const backCamera = devices.find(d => /back|rear|environment/i.test(d.label))
        const selectedDeviceId = (backCamera || devices[devices.length - 1]).deviceId

        this.engine = 'ZXing (JS)'
        this.status = 'Camera active, lecture en cours...'
        this.syncOverlaySize()

        await this.codeReader.decodeFromInputVideoDeviceContinuously(
          selectedDeviceId,
          this.$refs.video,
          (result, err) => {
            if (result) {
              if (result.getResultPoints) {
                this.drawZxingPoints(result.getResultPoints())
              }
              this.emitDetected(result)
            } else {
              this.clearOverlay()
            }
            if (err &&
              err.name !== 'NotFoundException' &&
              err.name !== 'ChecksumException' &&
              err.name !== 'FormatException') {
              console.warn('ZXing scan error', err)
            }
          }
        )
      } catch (err) {
        this.error = 'Impossible d\'acceder a la camera.'
        this.status = 'Erreur de scanner'
        console.error(err)
        if (typeof this.onError === 'function') {
          this.onError(err)
        }
      }
    },

    // -----------------------------------------------------------------
    // Camera stream avec contraintes optimisees
    // -----------------------------------------------------------------
    async getCameraStream () {
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          focusMode: 'continuous',
          advanced: [{ focusMode: 'continuous' }]
        }
      }
      return navigator.mediaDevices.getUserMedia(constraints)
    },

    // -----------------------------------------------------------------
    // Overlay canvas
    // -----------------------------------------------------------------
    syncOverlaySize () {
      const video = this.$refs.video
      const canvas = this.$refs.overlay
      if (!video || !canvas) return
      const resize = () => {
        canvas.width = video.videoWidth || video.clientWidth
        canvas.height = video.videoHeight || video.clientHeight
      }
      if (video.readyState >= 1) {
        resize()
      } else {
        video.addEventListener('loadedmetadata', resize, { once: true })
      }
    },

    drawBoxes (boxes) {
      const canvas = this.$refs.overlay
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#4caf50'
      ctx.lineWidth = 4
      boxes.forEach(b => {
        if (b) ctx.strokeRect(b.x, b.y, b.width, b.height)
      })
    },

    drawZxingPoints (points) {
      const canvas = this.$refs.overlay
      if (!canvas || !points || points.length === 0) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#4caf50'
      ctx.fillStyle = '#4caf50'
      ctx.lineWidth = 3
      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.getX(), p.getY())
        else ctx.lineTo(p.getX(), p.getY())
      })
      ctx.closePath()
      ctx.stroke()
      points.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.getX(), p.getY(), 5, 0, Math.PI * 2)
        ctx.fill()
      })
    },

    clearOverlay () {
      const canvas = this.$refs.overlay
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },

    // -----------------------------------------------------------------
    // Arret / nettoyage
    // -----------------------------------------------------------------
    cleanupNative () {
      if (this.nativeLoopId) {
        cancelAnimationFrame(this.nativeLoopId)
        this.nativeLoopId = null
      }
      this.nativeDetector = null
    },

    stopScanner () {
      this.running = false
      this.cleanupNative()

      // 1) Arreter ZXing (qui gere son propre MediaStream interne)
      if (this.codeReader) {
        try {
          this.codeReader.reset()
        } catch (err) {
          console.warn('Erreur lors de l\'arret du scanner ZXing', err)
        }
        this.codeReader = null
      }

      // 2) Couper toutes les pistes du stream que NOUS avons cree (mode natif)
      if (this.stream) {
        try {
          this.stream.getTracks().forEach(t => t.stop())
        } catch (err) {
          console.warn('Erreur arret pistes stream', err)
        }
        this.stream = null
      }

      // 3) Filet de securite : couper toute piste encore attachee a l'element
      //    video (ZXing attache son propre stream au <video> ; reset() ne le
      //    libere pas toujours de maniere fiable, notamment sur mobile).
      const video = this.$refs.video
      if (video) {
        const src = video.srcObject
        if (src && typeof src.getTracks === 'function') {
          try {
            src.getTracks().forEach(t => t.stop())
          } catch (err) {
            console.warn('Erreur arret pistes video', err)
          }
        }
        try {
          video.pause()
        } catch (err) { /* ignore */ }
        video.srcObject = null
        // Forcer le relachement en vidant la source
        video.removeAttribute('src')
        video.load()
      }
    },

    // Methode publique appelable depuis le parent via $refs
    stop () {
      this.stopScanner()
    },

    emitDetected (result) {
      const payload = {
        codeResult: {
          code: result.getText ? result.getText() : result.text || result
        }
      }
      if (typeof this.onDetected === 'function') {
        this.onDetected(payload)
      }
    }
  },

  async mounted () {
    await this.startScanner()
  },

  beforeUnmount () {
    this.stopScanner()
  }
}
</script>

<style scoped>
.scanner-container {
  padding: 0;
}
.scanner-view {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  aspect-ratio: 1 / 1;
  background: #000;
  overflow: hidden;
}
.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.scanner-overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.scanner-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.3;
}
.scanner-engine {
  font-size: 0.72rem;
  opacity: 0.85;
}
.scanner-error {
  margin-top: 8px;
  color: #ffcdd2;
}
</style>
