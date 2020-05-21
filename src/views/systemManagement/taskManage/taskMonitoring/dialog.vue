<template>
  <div>
    <!-- 解决打开弹窗就出现弹窗文字全选状态的bug -->
    <!-- <div style="position: fixed;bottom: -1000px;">
          <input ref="currentFocus" type="text" /> 
        </div> -->
    <el-dialog v-el-drag-dialog
               :title="param.title"
               :visible.sync="formVisible"
               width="80%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           ref="taskDialog">
        <div class="base-row"
             v-if="formVisible">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>数据列表</span>
            </div>
            <div class="row-option">
              <el-button ref="exportBtn"
                         type="primary"
                         size="mini">导出</el-button>
              <a @click="tableToggle=false"
                 v-if="tableToggle">
                <svg-icon icon-class="up" />&nbsp;收起</a>
              <a @click="tableToggle=true"
                 v-else>
                <svg-icon icon-class="down" />&nbsp;展开</a>
            </div>
          </div>
          <basic-table v-show="tableToggle"
                       ref="basicTable"
                       :height="containHeight"
                       :tableOption="configData"
                       :pagenation="true"
                       :rowNum="true"
                       :rowCheck="false">
          </basic-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
import BasicTable from 'basic-table-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
export default {
  directives: { elDragDialog },
  name: 'taskMonitoringDialog',
  components: {
    BasicTable
  },
  props: {
    param: {
      url: String,
      title: String
    }
  },
  mounted() {
    // this.containHeight = document.querySelector('.dialog-contant-default.log').offsetHeight
    // console.log(this.containHeight)
    // this.containHeight = document.querySelector('.dialog-contant-default.log').offsetHeight - 125
    // console.log(document.querySelector('.dialog-contant-default.log'))
  },
  created() {
    // this.containHeight = this.$store.state.app.containHeight - 200
    // console.log(this.containHeight)\
    // this.containHeight = document.querySelector('.dialog-contant-default.log').offsetHeight - 125
    // console.log(document.querySelector('.dialog-contant-default.log'))
  },
  data() {
    return {
      formVisible: false,
      containHeight: 0,
      configData: {}, // 模板数据
      tableToggle: true
    }
  },
  methods: {
    openDialog() {
      this.formVisible = true
      this.$nextTick(() => {
        // this.$refs.currentFocus.focus()
        this.containHeight = this.$refs.taskDialog.offsetHeight - 125
        baseRequest('/basic' + this.param.url).then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData('/basic' + this.param.url, param)
        })
      })
    }
  },
  watch: {
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-dialog {
  left: 5%;
}
</style>