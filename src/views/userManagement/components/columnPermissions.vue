<template>
  <el-dialog v-el-drag-dialog
             title="字段授权"
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
            <el-button icon="el-icon-edit"
                       @click="updateColumn">添加</el-button>
            <el-popover placement="left"
                        width="300"
                        v-model="visible2">
              <el-form ref="form"
                       :model="form"
                       label-width="80px">
                <el-form-item label="生效时间">
                  <el-date-picker type="datetime"
                                  popper-class='only-has-hour'
                                  format="yyyy-MM-dd HH"
                                  value-format="yyyy-MM-dd HH:mm:ss"
                                  placeholder="选择日期"
                                  v-model="form.validTime"
                                  style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="失效时间">
                  <el-date-picker type="datetime"
                                  popper-class='only-has-hour'
                                  format="yyyy-MM-dd HH"
                                  value-format="yyyy-MM-dd HH:mm:ss"
                                  placeholder="选择日期"
                                  v-model="form.invalidTime"
                                  style="width: 100%;"></el-date-picker>
                </el-form-item>
              </el-form>
              <div style="text-align: center; margin: 0">
                <el-button size="mini"
                           type="text"
                           @click="visible2 = false">取消</el-button>
                <el-button type="primary"
                           size="mini"
                           @click="subValidTime">确定</el-button>
              </div>
              <el-button icon="el-icon-setting"
                         slot="reference">设置有效期</el-button>
            </el-popover>
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
      <a-c ref='addColumn'
           @searchOption='searchOption'
           :paramData='paramData'></a-c>
    </div>
    <!-- <div slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOperate()">保存</el-button>
    </div> -->
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import AC from './addColumnPermissions'
const url = '/basic/columns/getColumnPermission'
export default {
  directives: {},
  name: 'userManagementComponentsColumnPermissions',
  components: {
    SearchForm,
    BasicTable,
    AC
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
      this.$refs.addColumn.openDialog()
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
          paramConvertMap: { permissionValue: checkedArr },
          permissionValue: 'null',
          roleId: this.paramData.roleId || null,
          userId: this.paramData.userId || null,
          permissionId: parseInt(this.paramData.permissionId) + 4 + ''
        }
        baseRequest('/basic/permissions/delete', param).then(request => {
          this.searchOption()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    }
  }
}
</script>

