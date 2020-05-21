<template>
  <div style="display:inline;">
    <span v-if="label" class="filter-item input-label">{{label}}:</span>
    <el-input v-if="type==='text'" clearable :placeholder="placeholder" style="width: 155px;" class="filter-item" :disabled="disabled"
     v-model="currentValue" @input="handleModelInput">
     </el-input>
    <el-select v-else-if="type==='select'" :placeholder="placeholder" style="width: 155px;" class="filter-item" clearable  v-model="currentValue" @input="handleModelInput" :disabled="disabled">
      <el-option
        v-for="(text,value) in selects"
        :key="value"
        :label="text"
        :value="value">
      </el-option>
    </el-select> 
    <el-date-picker v-else-if="type==='date'" clearable :placeholder="placeholder" style="width: 155px;" class="filter-item" :disabled="disabled"
      v-model="currentValue" :value-format="format" 
      :type="dateType" @input="handleModelInput">
    </el-date-picker>
    <el-input v-else-if="type==='textarea'" type="textarea" :placeholder="placeholder" :rows="rows" style="width: 300px;" class="filter-item" :disabled="disabled"
     v-model="currentValue" @input="handleModelInput">
     </el-input>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    type: String,
    value: [String, Number],
    selects: Object,
    format: String,
    dateType: String,
    disabled: Boolean,
    placeholder: String,
    rows: Number
  },
  data() {
    return {
      currentValue: this.value
    }
  },
  methods: {
    handleModelInput(event) {
      this.$emit('input', event)
    },
    changeToCurrentValue(val) {
      this.currentValue = val
    }
  }
}
</script>