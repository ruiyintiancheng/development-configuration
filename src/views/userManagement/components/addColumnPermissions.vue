<template>
  <el-dialog v-el-drag-dialog
             title="字段授权"
             append-to-body
             :close-on-click-modal='false'
             :visible.sync="formVisible"
             width="75%"
             custom-class="dialog-default">
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
    <div slot="footer"
         class="dialog-footer">
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary"
                 @click="saveOperate()">保存</el-button>
    </div>
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
const url = '/basic/columns/getColumnByTable'
export default {
  directives: {},
  name: 'roleManagementComponentsAddColumnPermissions',
  components: {
    SearchForm,
    BasicTable
  },
  props: {
    paramData: {
      type: [Object, Array]
    }
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      formVisible: false
    }
  },
  created() {
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 370
    }
  },
  methods: {
    openDialog() {
      this.formVisible = true
      this.getOption()
    },
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.permissionId = parseInt(this.paramData.permissionId) + 4 + ''
      param.userId = this.paramData.userId || null
      param.roleId = this.paramData.roleId || null
      param.tableId = this.paramData.tableId
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
    saveOperate() {
      const checkedNodes = this.$refs.basicTable.getSelect()
      const data = []
      for (var i = 0; i < checkedNodes.length; i++) {
        data.push(checkedNodes[i].column_id)
      }
      const param = {
        permissionValue: data,
        roleId: this.paramData.roleId || null,
        userId: this.paramData.userId || null,
        permissionId: parseInt(this.paramData.permissionId) + 4 + ''
      }
      baseRequest('/basic/permissions/addPermissionValue', param).then(request => {
        this.$emit('searchOption')
        this.formVisible = false
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
      })
    }
  }
}
</script>

