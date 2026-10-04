<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-toolbar color="blue-grey-lighten-1" density="comfortable">
        <v-btn icon title="fermer" @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        <v-toolbar-title>Scanner un code barre</v-toolbar-title>
      </v-toolbar>

      <v-alert
        v-if="cameraError"
        type="error"
        class="ma-3"
        variant="outlined"
      >
        {{ cameraError }}
      </v-alert>

      <scanner
        v-if="modelValue"
        ref="scanner"
        :on-detected="onBarcodeDetected"
        :on-error="onCameraError"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import Scanner from '@/components/Scanner'
import { stabilizeBarcode } from '@/utils/barcode'

export default {
  name: 'ScanDialog',

  components: {
    Scanner
  },

  props: {
    // v-model : etat ouvert/ferme de la modale (convention Vue 3)
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'detected'],

  data () {
    return {
      lastScanned: null,
      scanCount: 0,
      STABLE_THRESHOLD: 3,
      cameraError: null,
      detecting: false
    }
  },

  watch: {
    modelValue (open) {
      if (open) {
        // Reinitialiser l'etat de detection a chaque ouverture
        this.lastScanned = null
        this.scanCount = 0
        this.cameraError = null
        this.detecting = false
      } else {
        // Fermeture : couper la camera proprement
        this.stopScannerSafely()
      }
    }
  },

  mounted () {
    // Filet de securite : couper la camera si l'onglet passe en arriere-plan
    // ou si la page est masquee (changement d'app mobile, verrouillage).
    this._onHidden = () => {
      if (document.hidden) {
        this.stopScannerSafely()
      }
    }
    document.addEventListener('visibilitychange', this._onHidden)
    window.addEventListener('pagehide', this.stopScannerSafely)
  },

  beforeUnmount () {
    this.stopScannerSafely()
    document.removeEventListener('visibilitychange', this._onHidden)
    window.removeEventListener('pagehide', this.stopScannerSafely)
  },

  methods: {
    stopScannerSafely () {
      if (this.$refs.scanner && typeof this.$refs.scanner.stop === 'function') {
        this.$refs.scanner.stop()
      }
    },

    closeDialog () {
      this.stopScannerSafely()
      this.$emit('update:modelValue', false)
    },

    onBarcodeDetected (payload) {
      // Ignorer les detections une fois qu'un code stable a ete retenu
      if (this.detecting) return

      const code = payload.codeResult.code
      const result = stabilizeBarcode(
        this.lastScanned,
        this.scanCount,
        code,
        this.STABLE_THRESHOLD
      )
      this.lastScanned = result.lastScanned
      this.scanCount = result.scanCount

      if (result.navigate) {
        this.detecting = true
        // Arreter la camera AVANT de signaler la detection
        this.stopScannerSafely()
        this.$emit('update:modelValue', false)
        this.$emit('detected', code)
      }
    },

    onCameraError (err) {
      const message = (err && err.message) ? err.message : String(err)
      this.cameraError = 'Impossible d\'acceder a la camera : ' + message
    }
  }
}
</script>
