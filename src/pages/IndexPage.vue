<template>
  <q-page class="flex flex-center my-page">
    <q-card
      flat
      class="q-pa-md my-card">
      <q-card-section>
        <!--{{ formData }}-->
        <q-form
          @submit.prevent.stop="onSubmit"
          @reset="onReset"
          greedy
          ref="form"
        >
          <div class="row q-col-gutter-md">
            <div class="col-12 text-center my-div">
              <q-btn-toggle
                v-model="typ"
                class="my-custom-toggle"
                no-caps
                rounded
                unelevated
                toggle-color="primary"
                color="white"
                text-color="primary"
                :options="typMoznosti"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                no-error-icon
                outlined
                hide-bottom-space
                v-model="formData.zaciatok_poistenia"
                label="Začiatok poistenia *"
                label-color="primary"
                reactive-rules
                :rules="[val => val && val.length > 7 || '', isValidDate, isValidDateStart]"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
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
                hide-bottom-space
                v-model="koniec_poistenia"
                :label="typ === 'kratkodobe' ? 'Koniec poistenia *' : 'Koniec poistenia'"
                label-color="primary"
                reactive-rules
                :rules="typ === 'kratkodobe' ? [val => val && val.length > 7 || '', isValidDate, isValidDateEnd] : []"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
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
            <div class="col-12 col-md-6">
              <q-select
                :options="balikMoznosti"
                v-model="formData.balik"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                hide-bottom-space
                outlined
                label-color="primary"
                label="Balík *"
                :rules="[val => val !== undefined || '']"
                no-error-icon
                @update:model-value="resetVysledok"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                :options="pocetOsobMoznosti"
                v-model="formData.pocet_osob"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                hide-bottom-space
                outlined
                label-color="primary"
                label="Počet osôb *"
                :rules="[val => val !== undefined || '']"
                no-error-icon
                @update:model-value="resetVysledok"
              />
            </div>
            <div class="col-12">
              <q-select
                :options="pripoisteniaMoznosti"
                v-model="formData.pripoistenia"
                multiple
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
              />
            </div>
          </div>
          <div class="my-div2">
            <q-btn
              class="my-btn"
              outline
              size="lg"
              label="Reset"
              type="reset"
              color="primary"
            />
            <q-btn size="lg" label="Vypočítať" type="submit" color="primary"/>
          </div>
        </q-form>
        <div class="text-center vysledok">
          <b class="text-primary">{{ vysledok }}</b>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'IndexPage',
  data() {
    return {
      typ: 'kratkodobe',
      koniec_poistenia: null,
      koniec_poistenia_temp: null,
      formData: {},
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
      typMoznosti: [
        {label: 'Krátkodobé poistenie', value: 'kratkodobe'},
        {label: 'Celoročné poistenie', value: 'celorocne'}
      ],
      balikMoznosti: [
        {id: 'zakladny', name: 'základný', kratkodoba_cena: 1.2, celorocna_cena: 39},
        {id: 'rozsireny', name: 'rozšírený', kratkodoba_cena: 1.8, celorocna_cena: 49},
        {id: 'extra', name: 'extra', kratkodoba_cena: 2.4, celorocna_cena: 59}
      ],
      pocetOsobMoznosti: [
        {id: 1, name: 1},
        {id: 2, name: 2},
        {id: 3, name: 3}
      ],
      pripoisteniaMoznosti: [
        {id: 'storno_cesty', name: 'storno cesty', kratkodoba_prirazka: 1.5, celorocna_prirazka: 1.2},
        {id: 'sportove_aktivity', name: 'športové aktivity', kratkodoba_prirazka: 1.3, celorocna_prirazka: 1.1},
      ],
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
      setTimeout(this.$refs.form.resetValidation, 0)
    },
    koniec_poistenia(newValue) {
      if (newValue !== null) {
        this.koniec_poistenia_temp = newValue
      }
    }
  },
  methods: {
    onSubmit() {
      this.vysledok = ''
      const selectedBalik = this.balikMoznosti.find((item) => item.id === this.formData.balik)
      const pocetOsob = this.formData.pocet_osob

      if (!selectedBalik || !pocetOsob) {
        return
      }

      const priceType = this.typ === 'kratkodobe' ? 'kratkodoba' : 'celorocna'
      const zakladnaCena = selectedBalik[`${priceType}_cena`]
      const storno = this.getPripoisteniePrirazka('storno_cesty', priceType)
      const sportove = this.getPripoisteniePrirazka('sportove_aktivity', priceType)
      const pocetDni = this.typ === 'kratkodobe'
        ? this.numberOfDays(
          this.parseDate(this.formData.zaciatok_poistenia),
          this.parseDate(this.koniec_poistenia)
        )
        : 1

      this.vysledok = (`Suma: ${(pocetDni * zakladnaCena * pocetOsob * storno * sportove).toFixed(2)} €`).replace('.', ',')
    },
    onReset() {
      this.typ = 'kratkodobe'
      this.koniec_poistenia = null
      this.koniec_poistenia_temp = null
      this.formData = {}
      this.vysledok = ''
      setTimeout(this.$refs.form.resetValidation, 0)
    },
    parseDate(dateString) {
      const [day, month, year] = dateString.split('.').map(Number)
      return new Date(year, month - 1, day)
    },
    isValidDate(val) {
      const datePattern = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.\d{4}$/
      return datePattern.test(val) || ''
    },
    isValidDateBoolean(val) {
      const datePattern = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.\d{4}$/
      return datePattern.test(val)
    },
    isValidDateStart(val) {
      if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.koniec_poistenia !== null) &&
        (this.isValidDateBoolean(this.koniec_poistenia)) &&
        this.datesAreOnSameDay(
          this.parseDate(val),
          this.parseDate(this.koniec_poistenia))) {
        return false
      } else if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.koniec_poistenia !== null) &&
        (this.isValidDateBoolean(this.koniec_poistenia)) &&
        this.secondDateIsAfter(
          this.parseDate(this.koniec_poistenia),
          this.parseDate(val),
        )) {
        return false
      } else if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.koniec_poistenia !== null) &&
        (this.isValidDateBoolean(this.koniec_poistenia)) &&
        this.numberOfDays(
          this.parseDate(this.koniec_poistenia),
          this.parseDate(val),
        ) > 364) {
        return false
      }
      return true
    },
    isValidDateEnd(val) {
      if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.formData.zaciatok_poistenia !== null) &&
        (this.isValidDateBoolean(this.formData.zaciatok_poistenia)) &&
        this.datesAreOnSameDay(
          this.parseDate(val),
          this.parseDate(this.formData.zaciatok_poistenia))) {
        return false
      } else if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.formData.zaciatok_poistenia !== null) &&
        (this.isValidDateBoolean(this.formData.zaciatok_poistenia)) &&
        this.secondDateIsAfter(
          this.parseDate(val),
          this.parseDate(this.formData.zaciatok_poistenia))) {
        return false
      } else if ((this.typ === 'kratkodobe') && (val !== null) &&
        (this.isValidDateBoolean(val)) && (this.formData.zaciatok_poistenia !== null) &&
        (this.isValidDateBoolean(this.formData.zaciatok_poistenia)) &&
        this.numberOfDays(
          this.parseDate(val),
          this.parseDate(this.formData.zaciatok_poistenia))
        > 364) {
        return false
      }
      return true
    },
    datesAreOnSameDay(first, second) {
      return first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    },
    secondDateIsAfter(first, second) {
      return second.valueOf() > first.valueOf()
    },
    numberOfDays(first, second) {
      const firstUtc = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
      const secondUtc = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())
      const differenceInDays = Math.abs(secondUtc - firstUtc) / (1000 * 3600 * 24)
      return differenceInDays + 1
    },
    hasPripoistenie(id) {
      return Array.isArray(this.formData.pripoistenia) && this.formData.pripoistenia.includes(id)
    },
    getPripoisteniePrirazka(id, priceType) {
      if (!this.hasPripoistenie(id)) {
        return 1
      }

      const pripoistenie = this.pripoisteniaMoznosti.find((item) => item.id === id)
      if (!pripoistenie) {
        return 1
      }

      return pripoistenie[`${priceType}_prirazka`] || 1
    },
    resetVysledok() {
      this.vysledok = ''
    }
  }
})
</script>

<style lang="sass" scoped>
  .my-custom-toggle
    border: 1px solid #027be3
  .my-card
    margin: 30px 15px
    max-width: 500px
    border-radius: 20px
  .my-page
    background: #e5e5e5
  .my-div
    padding-bottom: 15px
  .my-div2
    text-align: center
    padding-top: 25px !important
  .my-btn
    margin-right: 15px
  .vysledok
    padding-top: 20px
</style>
