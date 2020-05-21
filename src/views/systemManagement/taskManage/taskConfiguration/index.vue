<template>
  <div>
    <el-tabs class="my-chart"
             v-model="activeName"
             :style="{paddingLeft:'20px'}">
      <el-tab-pane label="任务流程图"
                   name="first"
                   :style="{height: containHeight+'px',overflowY: 'scroll'}">
        <div>
          <processG6></processG6>
        </div>
      </el-tab-pane>
      <el-tab-pane label="任务列表"
                   name="second">
        <div>
          <tableList></tableList>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import tableList from './taskTableList'
import processG6 from './processG6'
export default {
  sourceData: {},
  currentFun: '',
  name: 'taskManageIndex',
  components: { processG6, tableList },
  mounted() {
    this.getOption()
    this.containHeight = document.querySelector('.app-main').offsetHeight - 65
  },
  data() {
    return {
      containHeight: 0,
      tabHeight: '',
      activeName: 'first'
    }
  },
  created() {
  },
  methods: {
    // 初始化数据
    getOption() {
      baseRequest('/basic/taskManage/flowChartedges').then(response => { // 线
        const result = response.data
        this.sourceData = result.item
      })
    }
  },
  watch: {}
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>