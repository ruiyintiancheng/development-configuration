<template>
  <el-dialog v-el-drag-dialog
             title="字段配置"
             append-to-body
             :close-on-click-modal='false'
             :visible.sync="formVisible"
             width="75%"
             custom-class="dialog-default no-footer">
    <div class="dialog-contant-default">
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
                       @click="getOption">重置</el-button>
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
            <el-button icon="el-icon-error"
                       @click="handleDelete">删除</el-button>
            <el-button icon="el-icon-circle-plus-outline"
                       @click="updateColumn">添加</el-button>
            <el-button icon="el-icon-edit"
                       @click="setStatus('1')">有效</el-button>
            <el-button icon="el-icon-edit"
                       @click="setStatus('0')">无效</el-button>
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
                     :height='tableHeight'
                     :tableOption="configData"
                     :pagenation="true"
                     :rowNum="false"
                     :rowCheck="true">
        </basic-table>
      </div>
    </div>
    <add-column ref="addColumn"
                @searchOption='searchOption'></add-column>
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import addColumn from './addColumnPermission'
import { baseRequest } from '@/api/base'
const url = '/basic/columnPermission/getPermissionHaveColumn'
export default {
  directives: {},
  name: 'permissionConfigurationComponentsColumnConfig',
  components: {
    SearchForm,
    BasicTable,
    addColumn
  },
  props: {
    paramData: {
      type: [Object, Array]
    }
  },
  data() {
    return {
      configData: {}, // 模板数据
      permissionId: null,
      searchToggle: true,
      tableToggle: true,
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      visible2: false,
      form: {}
    }
  },
  created() {
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 320
    }
  },
  methods: {
    openDialog(permissionId) {
      this.permissionId = permissionId
      this.formVisible = true
      this.getOption()
    },
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.permissionId = this.permissionId
      this.$refs.basicTable.getData(url, param)
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(() => {
          this.searchOption()
        })
      })
    },
    // 设置有效期
    subValidTime() { // 提交有效期
      const checkeds = this.$refs.basicTable.getSelect()
      if (!checkeds || checkeds.length === 0) {
        this.$message({
          type: 'warning',
          message: '请先选择要设置的资源!'
        })
        return
      }
      const checkedArr = []
      for (var index = 0; index < checkeds.length; index++) {
        checkedArr.push(checkeds[index].column_id)
      }
      const param = {
        invalidTime: this.form.invalidTime || null,
        validTime: this.form.validTime || null,
        paramConvertMap: { permissionValue: checkedArr },
        permissionValue: 'null',
        roleId: this.paramData.roleId || null,
        userId: this.paramData.userId || null,
        permissionId: parseInt(this.paramData.permissionId) + 4 + ''
      }
      baseRequest('/basic/permissions/setVilidTime', param).then(request => {
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
        this.visible2 = false
        this.searchOption()
      })
    },
    updateColumn() {
      this.$refs.addColumn.openDialog(this.permissionId)
    },
    // 资源删除
    handleDelete() {
      const checkeds = this.$refs.basicTable.getSelect()
      if (!checkeds || checkeds.length === 0) {
        this.$message({
          type: 'warning',
          message: '请先选择要删除的资源!'
        })
        return
      }
      const checkedArr = []
      for (var index = 0; index < checkeds.length; index++) {
        checkedArr.push(checkeds[index].column_id)
      }
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          paramConvertMap: { columnId: checkedArr },
          columnId: 0,
          permissionId: this.permissionId
        }
        baseRequest('/basic/columnPermission/delete', param).then(request => {
          this.searchOption()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    setStatus(code) {
      // 设置是否有效
      const checkeds = this.$refs.basicTable.getSelect()
      if (!checkeds || checkeds.length === 0) {
        this.$message({
          type: 'warning',
          message: '请先选择要删除的资源!'
        })
        return
      }
      const checkedArr = []
      for (var index = 0; index < checkeds.length; index++) {
        checkedArr.push(checkeds[index].column_id)
      }
      const param = {
        paramConvertMap: { columnId: checkedArr },
        columnId: 0,
        status: code,
        permissionId: this.permissionId
      }
      baseRequest('/basic/columnPermission/setStatus', param).then(request => {
        this.searchOption()
        this.$message({
          type: 'success',
          message: '设置成功!'
        })
      })
    }
  }
}
</script>

