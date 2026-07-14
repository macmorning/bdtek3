<template>
  <v-container class="scanner-container">
    <div class="scanner-view">
      <video ref="video" class="scanner-video" muted playsinline></video>
      <div class="scanner-overlay">
        <div class="scanner-status">{{ status }}</div>
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
    }
  },
  data () {
    return {
      status: 'Initialisation du scanner...',
      error: '',
      codeReader: null
    }
  },
  methods: {
    async startScanner () {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93
      ])
      this.codeReader = new BrowserMultiFormatReader(hints)

      try {
        const devices = await this.codeReader.listVideoInputDevices()
        if (!devices || devices.length === 0) {
          this.error = 'Aucune caméra détectée.'
          this.status = 'Scanner indisponible'
          return
        }

        const selectedDeviceId = devices[0].deviceId
        this.status = 'Caméra active, lecture en cours...'

        await this.codeReader.decodeFromInputVideoDeviceContinuously(
          selectedDeviceId,
          this.$refs.video,
          (result, err) => {
            if (result) {
              this.emitDetected(result)
            }
            if (err && err.name !== 'NotFoundException' && err.name !== 'ChecksumException' && err.name !== 'FormatException') {
              console.warn('ZXing scan error', err)
            }
          }
        )
      } catch (err) {
        this.error = 'Impossible d’accéder à la caméra.'
        this.status = 'Erreur de scanner'
        console.error(err)
      }
    },
    stopScanner () {
      if (this.codeReader) {
        try {
          this.codeReader.reset()
        } catch (err) {
          console.warn('Erreur lors de l’arret du scanner', err)
        }
      }
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
  min-height: 320px;
  background: #000;
}
.scanner-video {
  width: 100%;
  height: auto;
  display: block;
}
.scanner-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.95rem;
}
.scanner-error {
  margin-top: 8px;
  color: #ffcdd2;
}
</style>
