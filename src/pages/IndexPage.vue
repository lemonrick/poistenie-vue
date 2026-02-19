<template>
  <q-page class="page-shell">
    <div class="page-content">
      <q-card flat class="calculator-card">
        <q-card-section class="card-head">
          <div class="head-top">
            <q-chip dense color="primary" text-color="white" icon="savings" class="head-chip">Kalkulačka</q-chip>
          </div>
          <h1 class="card-title">Poistné za pár sekúnd</h1>
          <p class="card-subtitle">
            Zvoľte typ poistenia, termín a balík. Výsledok sa prepočíta okamžite po odoslaní.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="card-body">
        <q-form
          @submit.prevent.stop="onSubmit"
          @reset="onReset"
          greedy
          ref="form"
          class="calculator-form"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 text-center">
              <q-btn-toggle
                v-model="typ"
                class="insurance-toggle"
                no-caps
                rounded
                unelevated
                toggle-color="primary"
                color="blue-1"
                text-color="primary"
                :options="typMoznosti"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                no-error-icon
                outlined
                dense
                hide-bottom-space
                v-model="formData.zaciatok_poistenia"
                label="Začiatok poistenia *"
                label-color="primary"
                reactive-rules
                :rules="[isRequiredDate, isValidDate, isValidDateStart]"
                bg-color="white"
                @click="openStartDatePopup"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-primary" @click.stop="openStartDatePopup">
                    <q-popup-proxy ref="startDatePopup" cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="formData.zaciatok_poistenia"
                        first-day-of-week="1"
                        :locale="myLocale"
                        minimal
                        mask="D.M.YYYY"
                        @update:model-value="resetVysledok"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Zavrieť" color="primary" flat/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :disable="typ === 'celorocne'"
                no-error-icon
                outlined
                dense
                hide-bottom-space
                v-model="koniec_poistenia"
                :label="typ === 'kratkodobe' ? 'Koniec poistenia *' : 'Koniec poistenia'"
                label-color="primary"
                reactive-rules
                :rules="typ === 'kratkodobe' ? [isRequiredDate, isValidDate, isValidDateEnd] : []"
                bg-color="white"
                @click="openEndDatePopup"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer text-primary" @click.stop="openEndDatePopup">
                    <q-popup-proxy ref="endDatePopup" cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="koniec_poistenia"
                        first-day-of-week="1"
                        :locale="myLocale"
                        minimal
                        mask="D.M.YYYY"
                        @update:model-value="resetVysledok"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Zavrieť" color="primary" flat/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-6 col-md-6">
              <q-select
                :options="balikMoznosti"
                v-model="formData.balik"
                dense
                :behavior="selectBehavior"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                hide-bottom-space
                outlined
                label-color="primary"
                label="Balík *"
                :rules="[isRequiredSelect]"
                no-error-icon
                @update:model-value="resetVysledok"
                bg-color="white"
              />
            </div>
            <div class="col-6 col-md-6">
              <q-input
                v-model.number="formData.pocet_osob"
                type="number"
                class="persons-input"
                dense
                hide-bottom-space
                outlined
                label-color="primary"
                label="Počet osôb *"
                :min="MIN_PERSONS"
                :max="MAX_PERSONS"
                :step="1"
                inputmode="numeric"
                no-error-icon
                :rules="[isRequiredSelect, isValidPersonCount]"
                @update:model-value="resetVysledok"
                bg-color="white"
              />
            </div>
            <div class="col-12">
              <q-select
                :options="pripoisteniaMoznosti"
                v-model="formData.pripoistenia"
                dense
                multiple
                :behavior="selectBehavior"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                hide-bottom-space
                outlined
                label-color="primary"
                label="Pripoistenia"
                no-error-icon
                @update:model-value="resetVysledok"
                bg-color="white"
              />
            </div>
          </div>
          <div class="actions-row">
            <q-btn
              class="action-btn"
              flat
              size="md"
              label="Reset"
              type="reset"
              color="grey-8"
              icon="restart_alt"
            />
            <q-btn class="action-btn" size="md" label="Vypočítať cenu" type="submit" color="primary"/>
          </div>
        </q-form>
        <div class="result-wrap" :class="{ 'result-wrap--active': Boolean(vysledok) }">
          <div class="result-label">Výsledok</div>
          <div class="result-value">{{ vysledok || 'Zatiaľ bez výpočtu' }}</div>
        </div>
      </q-card-section>
    </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import {
  typMoznosti,
  balikMoznosti,
  MIN_PERSONS,
  MAX_PERSONS,
  pripoisteniaMoznosti,
  calculateInsuranceSum,
  formatCurrency,
  isValidSkDate,
  validateShortTermDateRange,
  validatePersonCount
} from 'src/utils/insurance'

export default defineComponent({
  name: 'IndexPage',
  computed: {
    selectBehavior() {
      return this.$q.screen.lt.md ? 'dialog' : 'menu'
    }
  },
  data() {
    return {
      typ: 'kratkodobe',
      koniec_poistenia: null,
      koniec_poistenia_temp: null,
      formData: {
        zaciatok_poistenia: null,
        balik: null,
        pocet_osob: null,
        pripoistenia: []
      },
      myLocale: {
        /* starting with Sunday */
        days: ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'],
        daysShort: ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So'],
        months: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl', 'August', 'September', 'Október', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
        firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
        format24h: true,
        pluralDay: 'dní'
      },
      typMoznosti,
      balikMoznosti,
      MIN_PERSONS,
      MAX_PERSONS,
      pripoisteniaMoznosti,
      vysledok: ''
    }
  },
  watch: {
    typ(newValue) {
      if (newValue === 'celorocne') {
        this.koniec_poistenia = null
      } else if (newValue === 'kratkodobe' && this.koniec_poistenia_temp !== null) {
        this.koniec_poistenia = this.koniec_poistenia_temp
      }
      this.vysledok = ''
      setTimeout(() => this.$refs.form?.resetValidation(), 0)
    },
    koniec_poistenia(newValue) {
      if (newValue !== null) {
        this.koniec_poistenia_temp = newValue
      }
    }
  },
  methods: {
    async onSubmit() {
      const formIsValid = await this.$refs.form?.validate()
      if (!formIsValid) {
        return
      }

      this.vysledok = ''

      try {
        const result = calculateInsuranceSum({
          typ: this.typ,
          zaciatokPoistenia: this.formData.zaciatok_poistenia,
          koniecPoistenia: this.koniec_poistenia,
          balikId: this.formData.balik,
          pocetOsob: this.formData.pocet_osob,
          pripoistenia: this.formData.pripoistenia
        })
        this.vysledok = formatCurrency(result)
      } catch (error) {
        this.vysledok = error.message
      }
    },
    onReset() {
      this.typ = 'kratkodobe'
      this.koniec_poistenia = null
      this.koniec_poistenia_temp = null
      this.formData = {
        zaciatok_poistenia: null,
        balik: null,
        pocet_osob: null,
        pripoistenia: []
      }
      this.vysledok = ''
      setTimeout(() => this.$refs.form?.resetValidation(), 0)
    },
    isRequiredDate(val) {
      return Boolean(val && String(val).trim().length > 0) || 'Toto pole je povinné.'
    },
    isRequiredSelect(val) {
      return val !== undefined && val !== null || 'Toto pole je povinné.'
    },
    isValidPersonCount(val) {
      const validation = validatePersonCount(val, this.MIN_PERSONS, this.MAX_PERSONS)
      return validation.valid || validation.message
    },
    isValidDate(val) {
      return isValidSkDate(val) || 'Neplatný dátum. Použite formát D.M.RRRR.'
    },
    isValidDateStart(val) {
      if (this.typ !== 'kratkodobe') {
        return true
      }
      if (!isValidSkDate(val) || !isValidSkDate(this.koniec_poistenia)) {
        return true
      }

      const validation = validateShortTermDateRange(val, this.koniec_poistenia)
      return validation.valid || validation.message
    },
    isValidDateEnd(val) {
      if (this.typ !== 'kratkodobe') {
        return true
      }
      if (!isValidSkDate(val) || !isValidSkDate(this.formData.zaciatok_poistenia)) {
        return true
      }

      const validation = validateShortTermDateRange(this.formData.zaciatok_poistenia, val)
      return validation.valid || validation.message
    },
    resetVysledok() {
      this.vysledok = ''
    },
    openStartDatePopup() {
      this.$refs.startDatePopup?.show()
    },
    openEndDatePopup() {
      if (this.typ === 'celorocne') {
        return
      }
      this.$refs.endDatePopup?.show()
    }
  }
})
</script>

<style lang="sass" scoped>
.page-shell
  display: flex
  justify-content: center
  padding: 42px 14px 34px

.page-content
  width: 100%
  max-width: 860px

.calculator-card
  border-radius: 24px
  border: 1px solid rgba(59, 130, 246, 0.18)
  box-shadow: 0 14px 36px rgba(30, 64, 175, 0.14)
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)

.card-head
  padding: 22px 22px 16px

.head-top
  margin-bottom: 12px

.card-title
  margin: 0
  font-size: clamp(1.25rem, 1.8vw, 1.6rem)
  line-height: 1.2
  color: #0f172a

.card-subtitle
  margin: 10px 0 0
  color: #475569
  font-size: 0.95rem

.card-body
  padding: 18px 22px 22px

.insurance-toggle
  border: 1px solid rgba(37, 99, 235, 0.35)

.actions-row
  display: flex
  justify-content: center
  gap: 10px
  padding-top: 22px

.action-btn
  min-width: 132px
  padding: 0 10px
  border-radius: 12px
  font-size: 0.9rem

.persons-input :deep(input[type=number])
  -moz-appearance: textfield

.persons-input :deep(input[type=number]::-webkit-outer-spin-button)
  -webkit-appearance: none
  margin: 0

.persons-input :deep(input[type=number]::-webkit-inner-spin-button)
  -webkit-appearance: none
  margin: 0

.result-wrap
  margin-top: 20px
  padding: 14px 16px
  border-radius: 14px
  border: 1px dashed rgba(100, 116, 139, 0.45)
  background: #f8fafc
  transition: all 180ms ease

.result-wrap--active
  border-style: solid
  border-color: rgba(2, 123, 227, 0.4)
  background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)

.result-label
  font-size: 0.78rem
  text-transform: uppercase
  letter-spacing: 0.08em
  color: #64748b
  margin-bottom: 6px

.result-value
  font-size: 1.08rem
  font-weight: 700
  color: #0f172a

@media (max-width: 600px)
  .page-shell
    padding-top: 22px
  .card-head
    padding: 16px 14px 10px
  .card-body
    padding: 12px 14px 16px
  .insurance-toggle
    transform: scale(0.97)
    transform-origin: center top
  .insurance-toggle :deep(.q-btn)
    min-height: 38px
    padding: 0 12px
    font-size: 0.86rem
  .actions-row
    flex-direction: row
    gap: 8px
  .action-btn
    flex: 1
    width: auto
    min-width: 0
    font-size: 0.86rem

@media (min-width: 1024px)
  .page-shell
    padding: 34px 14px 16px
  .calculator-card
    max-width: 820px
  .card-head
    padding: 14px 18px 8px
  .card-title
    font-size: 1.2rem
  .card-subtitle
    margin-top: 6px
    font-size: 0.88rem
  .card-body
    padding: 12px 18px 16px
  .actions-row
    padding-top: 14px
  .result-wrap
    margin-top: 14px
    padding: 12px 14px
</style>
