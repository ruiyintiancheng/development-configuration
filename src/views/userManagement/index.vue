/*
 * @Author: M.HQ 
 * @Date: 2019-02-12 15:48:29 
 * @Last Modified by: lk
 * @Last Modified time: 2019-07-16 15:42:28
 * @Description: 用户管理
 */

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
                     @click="addUser()">添加</el-button>
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
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <el-table-column slot="optionColumn"
                         label="操作"
                         fixed="right"
                         align="center"
                         width="300">
          <template slot-scope="scope">
            <el-button type="info"
                       plain
                       size="mini"
                       @click="functionalPermissions(scope.row)">权限设置</el-button>
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="warning"
                       plain
                       size="mini"
                       @click="resetPassword(scope.row)">重置密码</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="dialogTitle[operateStatus]"
               :visible.sync="formVisible"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default-addOrUpdate">
        <update-form ref="updateFrom"
                     :updateFormData="updateFormData"></update-form>
      </div>
      <div slot="footer"
           class="dialog-footer-addOrUpdate">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="授权"
               v-el-drag-dialog
               :visible.sync="roleFormVisible"
               :close-on-click-modal='true'
               width="80%"
               custom-class="dialog-default no-footer">
      <div class="dialog-contant-default roleManagement">
        <el-tabs @tab-click="handleClick"
                 v-model="activeName"
                 type="card">
          <el-tab-pane v-for="item in permissionList"
                       :key="item.permissionId"
                       :label="item.permissionName"
                       :name="item.permissionId + ''">
            <!--功能权限 -->
            <FP v-if="item.dataCategory === '0' && paramData.permissionId === item.permissionId + ''"
                :paramData='paramData'></FP>
            <!--表权限-->
            <TP v-if="(item.dataCategory === '1' || item.dataCategory === '2') && paramData.permissionId === item.permissionId + ''"
                :paramData='paramData'></TP>
            <!--数据权限-->
            <data-permission v-if="item.dataCategory === '5' && paramData.permissionId === item.permissionId + ''"
                             :paramData='paramData'></data-permission>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import FP from './components/functionalPermissions'
import TP from './components/tablePermissions'
import OP from './components/organizationPermissions'
import BL from './components/businessLine'
import dataPermission from './components/businessLine'
const url = '/basic/users/getUsers'
export default {
  directives: {},
  name: 'userManagementIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    FP,
    OP,
    TP,
    BL,
    dataPermission
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      roleFormVisible: false, // 弹框开关
      languageData: null, // 语言设置数据
      operateStatus: null, // 操作选项
      msgId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      },
      paramData: {
        userId: null,
        permissionId: null
      },
      permissionList: [],
      activeName: 'first'
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
      // 获取所有的标签页
      baseRequest('/basic/permissions/getPermissionList', { user: 1, orderBySection: 'DATA_CATEGORY,PERMISSION_TYPE' }).then(response => {
        this.permissionList = response.data.item
        this.paramData.permissionId = response.data.item[0].permissionId + ''
        this.$nextTick(_ => {
          this.activeName = response.data.item[0].permissionId + ''
        })
      })
    },
    // 权限设置
    functionalPermissions(row) {
      this.paramData.userId = row.user_id
      this.paramData.permissionId = this.permissionList[0].permissionId + ''
      this.activeName = this.permissionList[0].permissionId + ''
      this.roleFormVisible = true
    },
    // 添加
    addUser() {
      this.operateStatus = 1
      this.getAddForm()
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      baseRequest('/basic/users/select').then(response => {
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = {
        userId: row.user_id
      }
      baseRequest('/basic/users/select', param).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        // result.validator = JSON.parse(result.validator)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 保存操作
    saveOperate() {
      const param = this.$refs.updateFrom.getFormData()
      this.$refs.updateFrom.saveRequest('/users/saveAdd', param).then(response => {
        this.searchOption()
        this.$Message.success('操作成功')
        this.formVisible = false
      })
    },
    handleClick(tab) {
      this.paramData.permissionId = tab.name
    },
    resetPassword(row) {
      this.$confirm('此操作将重置该用户密码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          userId: row.user_id || null,
          loginName: row.login_name || null
        }
        baseRequest('/basic/users/resetPassword', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-contant-default-addOrUpdate {
  margin-top: 10px;
  padding: 0px;
  border: 0px;
}
.dialog-footer-addOrUpdate {
  margin: 0px;
}
.el-form-item {
  margin-bottom: 0px;
}
</style>



