<template>
  <q-layout view="lHh Lpr lFf" class="app-shell">
    <q-header class="app-header" bordered>
      <q-toolbar class="q-px-md q-py-sm">
        <q-avatar size="38px" color="white" text-color="primary" icon="flight_takeoff" />
        <div class="q-ml-md">
          <div class="header-title">Cestovné poistenie</div>
          <div class="header-subtitle">Rýchla kalkulačka ceny</div>
        </div>
        <q-space />
        <q-chip color="white" text-color="primary" dense icon="verified">Online</q-chip>
      </q-toolbar>
    </q-header>

    <q-page-container class="page-wrap">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout'
})
</script>

<style lang="sass" scoped>
.app-shell
  background: linear-gradient(155deg, #f2f8ff 0%, #e8f0ff 40%, #f8fbff 100%)

.app-header
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #38bdf8 100%)
  color: #fff
  backdrop-filter: saturate(140%) blur(4px)

.header-title
  font-size: 1.03rem
  font-weight: 700
  line-height: 1.1

.header-subtitle
  font-size: 0.78rem
  opacity: 0.9

.page-wrap
  min-height: calc(100vh - 64px)
</style>
