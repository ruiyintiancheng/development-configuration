<template>
  <div class="app-container">
    <div class="row-botton clearfix">
      <div class="row-title">
        <svg-icon icon-class="ul" />
        <span>数据列表</span>
      </div>
      <div class="row-option">
        <el-button size="mini">未计算</el-button>
        <el-button size="mini">计算完成</el-button>
        <el-button size="mini">重新计算</el-button>
        <el-button size="mini"
                   @click="handleDelete">删除</el-button>
        <el-button size="mini"
                   type="primary">导出</el-button>
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
                 :rowCheck="true">
      <el-table-column slot="optionColumn"
                       label="子任务"
                       align="center"
                       width="150">
        <template slot-scope="scope">
          <a @click="childrenTask(scope.row)">
            <div style="width:100%;height:100%;color:blue;">{{scope.row.子任务}}</div>
          </a>
        </template>
      </el-table-column>
      <el-table-column slot="optionColumn"
                       label="操作"
                       align="center"
                       width="250">
        <template slot-scope="scope">
          <el-button type="text"
                     plain
                     size="mini"
                     @click="look(scope.row)">查看日志</el-button>
        </template>
      </el-table-column>
    </basic-table>
    <task-dialog :param="dialogParam"
                 ref="dialogBtn"></task-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import taskDialog from './dialog'
import { baseRequest } from '@/api/base'
import { getSearchParam } from '@/utils/index'
const url = '/basic/taskManage/flowChartNodes2'
export default {
  directives: {},
  name: 'systemManagementTaskManageTaskConfigurationTaskTableList',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    taskDialog // 日志弹窗
  },
  data() {
    return {
      containHeight: null,
      configData: {}, // 表格数据
      updateFormData: null, // 弹框数据
      searchToggle: true, // 查询下拉切换
      tableToggle: true, // 表格下拉切换
      operateStatus: null,
      formVisible: false,
      dialogTableUrl: '',
      tableToggle1: true,
      configData1: {},
      dialogParam: {
        url: '',
        title: ''
      }
    }
  },
  created() {
    this.getOption()
    this.containHeight = this.$store.state.app.containHeight - 170
  },
  methods: {
    // 点击查询
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      this.$refs.basicTable.getData(url, param)
    },
    look(row) {
      var param = {
        url: '/logManage/selects',
        title: '日志'
      }
      this.$emit('open-dialog', param) // 调用父节点的 打开弹窗方法
    },
    childrenTask(row) {
      var param = {
        url: '/taskManage/flowChartNodes2',
        title: '子任务'
      }
      this.$emit('open-dialog', param) // 调用父节点的 打开弹窗方法
    },
    // 初始化数据
    getOption() {
      baseRequest(url).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 资源删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = { systemId: row.systemId }
        baseRequest('/basic/submitted/delete', param).then(request => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    // 重置
    reset() {
      this.$refs.searchForm.resetForm()
    }
  }
}
</script>
<style scoped>
.code-tree {
  margin-top: 15px;
  height: 740px;
  overflow: overlay;
  border: 1px solid #e4e4e4;
}
</style>
