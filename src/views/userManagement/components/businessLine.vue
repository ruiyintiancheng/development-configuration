<template>
  <div class="app-container">
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
                     @click="updateRole">修改</el-button>
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
    <el-dialog v-el-drag-dialog
               append-to-body
               :title="dialogTitle[operateStatus]"
               :close-on-click-modal='false'
               :visible.sync="formVisible"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <el-tree ref="tree"
                 :data="treeData"
                 node-key="id"
                 :props="defaultProps"
                 default-expand-all
                 check-strictly
                 :expand-on-click-node='false'
                 show-checkbox></el-tree>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
const url = '/basic/permissions/getDataPermissionList'
export default {
  directives: { elDragDialog },
  name: 'userManagementComponentsBusinessLine',
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
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      languageData: null, // 语言设置数据
      operateStatus: null, // 操作选项
      msgId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '编辑',
        2: '修改'
      },
      visible2: false,
      form: {},
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 370
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.permissionId = this.paramData.permissionId
      param.userId = this.paramData.userId || null
      param.roleId = this.paramData.roleId || null
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
    // 修改
    updateRole() {
      this.operateStatus = 1
      baseRequest('/basic/permissions/getAllDataPermissionList', this.paramData).then(response => {
        this.treeData = response.data.item
        this.formVisible = true
        const checkeds = []
        this.setTreeChecked(this.treeData, checkeds)
        this.$nextTick(function() {
          this.$refs.tree.setCheckedKeys(checkeds)
        })
      })
    },
    setTreeChecked(data, checkeds) {
      if (!data) {
        return
      }
      for (var index = 0; index < data.length; index++) {
        data[index].status ? checkeds.push(data[index].id) : ''
        this.setTreeChecked(data[index].children, checkeds)
      }
    },
    saveOperate() {
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      console.log(checkedNodes)
      const data = []
      for (var i = 0; i < checkedNodes.length; i++) {
        data.push(checkedNodes[i].id)
      }
      const param = {
        paramConvertMap: { permissionValue: data },
        permissionValue: 'null',
        roleId: this.paramData.roleId || null,
        userId: this.paramData.userId || null,
        permissionId: this.paramData.permissionId
      }
      baseRequest('/basic/permissions/saveDataPermissionList', param).then(request => {
        this.searchOption()
        this.formVisible = false
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
      })
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
        checkedArr.push(checkeds[index].entity_code)
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
          permissionId: this.paramData.permissionId
        }
        baseRequest('/basic/permissions/delete', param).then(request => {
          this.searchOption()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
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
        checkedArr.push(checkeds[index].entity_code)
      }
      const param = {
        invalidTime: this.form.invalidTime || null,
        validTime: this.form.validTime || null,
        paramConvertMap: { permissionValue: checkedArr },
        permissionValue: 'null',
        roleId: this.paramData.roleId || null,
        userId: this.paramData.userId || null,
        permissionId: this.paramData.permissionId
      }
      baseRequest('/basic/permissions/setVilidTime', param).then(request => {
        this.$message({
          type: 'success',
          message: '操作成功!'
        })
        this.visible2 = false
        this.searchOption()
      })
    }
  }
}
</script>

