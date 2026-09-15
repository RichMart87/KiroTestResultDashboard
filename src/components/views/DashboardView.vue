<template>
  <div class="space-y-6">
    <!-- Summary cards -->
    <SummaryCards />

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TrendChart />
      <PassRateChart />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DurationChart />
      <SuiteDonutChart />
    </div>

    <!-- Tables row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FlakyTestsTable />
      <SlowestTestsTable />
    </div>

    <!-- Runs list -->
    <RunsList />
  </div>
</template>

<script setup>
import SummaryCards from '@/components/SummaryCards.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import PassRateChart from '@/components/charts/PassRateChart.vue'
import DurationChart from '@/components/charts/DurationChart.vue'
import SuiteDonutChart from '@/components/charts/SuiteDonutChart.vue'
import FlakyTestsTable from '@/components/FlakyTestsTable.vue'
import SlowestTestsTable from '@/components/SlowestTestsTable.vue'
import RunsList from '@/components/RunsList.vue'
</script>
