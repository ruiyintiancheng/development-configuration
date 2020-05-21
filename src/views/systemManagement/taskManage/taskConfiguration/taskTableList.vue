<template>
  <div class="app-container">
    <!-- 查询区域开始 -->
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="search" />
          <span>筛选查询</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-search"
                     @click="searchOption"
                     type="primary">查询</el-button>
          <el-button icon="el-icon-refresh"
                     @click="reset">重置</el-button>
          <a @click="searchToggle=false"
             v-if="searchToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="searchToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <search-form v-show="searchToggle"
                   ref="searchForm"
                   :inputCount="3"
                   :searchFormData="configData"></search-form>
    </div>
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-plus"
                     @click="addOption">添加</el-button>
          <el-button size="small"
                     icon="el-icon-download"
                     @click="download">导出</el-button>
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
                   :rowCheck='false'>
        <el-table-column slot="optionColumn"
                         label="操作"
                         align="center"
                         width="250">
          <template slot-scope="scope">
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="editRow(scope.row)">编辑</el-button>
            <el-button size="mini"
                       plain
                       type="danger"
                       @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <editDialog :param='param'
                ref="editDialog"
                @update-value="saveData"></editDialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import editDialog from './dialog'
import { baseRequest } from '@/api/base'
import { getSearchParam } from '@/utils/index'
const url = '/basic/taskManage/flowChartNodes'
export default {
  directives: {},
  name: 'systemManagementTaskManageTaskConfigurationTaskTableList',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    editDialog // 弹出
  },
  data() {
    return {
      containHeight: '',
      configData: {}, // 表格数据
      updateFormData: null, // 弹框数据
      searchToggle: true, // 查询下拉切换
      tableToggle: true, // 表格下拉切换
      operateStatus: null,
      param: {}
    }
  },
  created() {
    this.getOption()
    this.containHeight = this.$store.state.app.containHeight - 300
  },
  methods: {
    // 点击查询
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      this.$refs.basicTable.getData(url, param)
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
    addOption() {
      this.param.obj = {}
      this.$refs.editDialog.openDialog() // 显示弹窗
    },
    editRow(row) { // 编辑
      this.param.obj = row
      this.$refs.editDialog.openDialog() // 显示弹窗
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
    download() {
      this.$Message.success('导出成功')
    },
    saveData(obj) { // 保存数据
      this.$message({
        type: 'success',
        message: '保存成功!'
      })
      this.searchOption() // 重新查询
    },
    // 重置
    reset() {
      this.$refs.searchForm.resetForm()
    }
  }
}
</script>
<style scoped>
</style>
