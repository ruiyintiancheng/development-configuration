/*
 * @Author: M.HQ 
 * @Date: 2019-09-23 14:52:48 
 * @Last Modified by: 1k
 * @Last Modified time: 2019-09-27 17:58:48
 * @Description: 权限管理
 */
<template>
  <div class="permission-configuration">
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
                     @click="addOption">添加</el-button>
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
                         align="center"
                         :width="250"
                         fixed="right">
          <template slot-scope="scope">
            <el-button v-if="scope.row.dataCategory === '5'"
                       type="info"
                       plain
                       size="mini"
                       @click="columnConfig(scope.row)">字段配置</el-button>
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="danger"
                       plain
                       size="mini"
                       @click="deleteForm(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="dialogTitle[operateStatus]"
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="formVisible"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <update-form v-if="operateStatus!==3"
                     ref="updateFrom"
                     :updateFormData="updateFormData"></update-form>
        <el-form ref="form"
                 :model="item"
                 label-position="left"
                 label-width="100px"
                 class="baseUpdate-form">
          <el-form-item prop="joinType"
                        label="关联方式"
                        :error="error.joinType"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="item.joinType"
                       clearable>
              <el-option value="1"
                         label="列表"></el-option>
              <el-option value="2"
                         label="SQL"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="!item.joinType || item.joinType === '1'"
                        prop="componentId"
                        label="关联参数"
                        :rules="{validator: this.validator}"
                        :error="error.componentId">
            <el-input class="form-input"
                      v-model="item.componentId"
                      clearable>
            </el-input>
          </el-form-item>
          <el-form-item v-else
                        prop="permissionSql"
                        label="关联参数">
            <el-input class="form-input"
                      type="textarea"
                      :rows="3"
                      v-model="item.permissionSql"
                      clearable>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
    <columnConfg ref="columnConfig"></columnConfg>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import columnConfg from './components/columnConfig'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/permissions/selects'
export default {
  name: 'permissionConfigurationIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    columnConfg
  },
  data() {
    return {
      item: {
        joinType: '',
        permissionSql: '',
        componentId: ''
      },
      error: {
        joinType: '',
        permissionSql: '',
        componentId: ''
      },
      validator: (rule, value, callback) => {
        if (value) {
          if (/^\d+$/.test(value)) {
            callback()
          } else {
            callback(new Error('数据必须是数字'))
          }
        } else {
          callback()
        }
      },
      regexp: new RegExp('^\\d+$'),
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      permissionId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      }
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
    },
    // 点击添加
    addOption() {
      this.operateStatus = 1
      this.getAddForm()
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.permissionId = row.permissionId
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      for (const key in this.item) {
        this.item[key] = null
      }
      baseRequest('/basic/permissions/getAddData', param).then(response => {
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.form.clearValidate()
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = { permissionId: row.permissionId }
      baseRequest('/basic/permissions/select', param).then(response => {
        const result = response.data
        this.item.joinType = result.item.joinType
        this.item.permissionSql = result.item.permissionSql
        this.item.componentId = result.item.componentId
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.form.clearValidate()
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 删除
    deleteForm(row) {
      const param = { permissionId: row.permissionId }

      baseRequest('/basic/permissions/searchPermissionConfig', param).then(response => {
        const result = response.data.item.result
        if (result === 1) {
          this.$confirm('存在配置数据，确定删除？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            baseRequest('/basic/permissions/deletePermission', param).then(response => {
              this.searchOption()
              this.$Message.success('操作成功')
            })
          })
        } else {
          this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            baseRequest('/basic/permissions/deletePermission', param).then(response => {
              this.searchOption()
              this.$Message.success('操作成功')
            })
          })
        }
      })
    },
    // 保存操作
    saveOperate() {
      this.clearError()
      this.$refs.form.validate((valid) => {
        if (valid) {
          const param = this.$refs.updateFrom.getFormData()
          param.joinType = this.item.joinType
          if (param.joinType === '1') {
            param.componentId = this.item.componentId
          } else {
            param.permissionSql = this.item.permissionSql
          }
          if (this.operateStatus === 1) {
            this.$refs.updateFrom.saveRequest('/permissions/add', param).then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          } else if (this.operateStatus === 2) {
            param.permissionId = this.permissionId
            this.$refs.updateFrom.saveRequest('/permissions/update', param).then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          }
        } else {
          return false
        }
      })
    },
    columnConfig(row) { // 字段配置
      this.$refs.columnConfig.openDialog(row.permissionId)
    },
    // 验证操作
    validateElseItem(validateMsg) {
      for (const key in validateMsg) {
        if (this.error.hasOwnProperty(key)) {
          this.error[key] = validateMsg[key]
        }
      }
    },
    // 清空error
    clearError() {
      for (const key in this.error) {
        this.error[key] = ''
      }
    }
  }
}
</script>

<style lang="scss">
.permission-configuration {
  .baseUpdate-form {
    margin-left: calc(50% - 150px);
    .form-input {
      width: 255px;
    }
  }
}
</style>
