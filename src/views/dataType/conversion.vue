/*
元数据字段类型关系
author: 魏乐齐
date: 2019/9/10
*/
<template>
  <el-dialog title="查看"
             :visible.sync="mainVisible"
             :close-on-click-modal='false'
             v-el-drag-dialog
             width="77%"
             custom-class="dialog-default">
    <div class="dialog-contant-default file-download-log">
      <div class="base-row"
           v-show="false">
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
                     :height="tableHeight"
                     :tableOption="configData"
                     :pagenation="true"
                     :rowNum="true">
          <el-table-column slot="optionColumn"
                           label="操作"
                           align="center"
                           :width="250">
            <template slot-scope="scope">
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
                 :visible.sync="formVisible"
                 :close-on-click-modal='false'
                 v-el-drag-dialog
                 width="40%"
                 custom-class="dialog-default"
                 append-to-body>
        <div class="dialog-contant-default">
          <!-- <update-form ref="updateFrom" :updateFormData="updateFormData"></update-form> -->
          <el-form ref="form"
                   :model="updateFormData"
                   label-position="left"
                   label-width="120px"
                   class="baseUpdate-form">
            <el-form-item prop="dsType"
                          label="目标数据源类型"
                          :rules="[{required:true,message:'数据不能为空', trigger: 'change'}]">
              <el-select class="form-input"
                         :disabled="disTypeDisabled"
                         v-model="updateFormData.dsType"
                         @change="handleDsType"
                         clearable>
                <template v-for="(value,name) in dsType">
                  <el-option :key="name"
                             :value="name"
                             :label="value">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item prop="targetTypeId"
                          label="目标类型ID"
                          :rules="[{required: true, message: '数据不能为空', trigger: 'blur'}]">
              <el-select class="form-input"
                         v-model="updateFormData.targetTypeId"
                         clearable>
                <template v-for="(value,name) in targetType">
                  <el-option :key="name"
                             :value="name"
                             :label="value">
                  </el-option>
                </template>
              </el-select>
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
    </div>
  </el-dialog>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/t00ColumnTypeConvert/selects'
export default {
  components: {
    SearchForm,
    BasicTable,
    UpdateForm
  },
  data() {
    return {
      loading: false,
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      tableHeight: 0,
      // updateFormData: null,
      updateFormData: {
        dsType: null,
        targetTypeId: null
      }, // 弹框数据
      disTypeDisabled: false,
      dsType: null,
      targetType: null,
      mainVisible: false, // 组件开关
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      typeId: null, // 修改保存参数id
      row: null,
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      }
    }
  },
  created() {
    // this.getOption()
  },
  methods: {
    openDialog(param) {
      this.typeId = param.typeId
      this.row = param
      this.mainVisible = true
      this.$nextTick(function() {
        this.tableHeight = document.querySelector('.dialog-contant-default.file-download-log').offsetHeight - 124
      })
      this.getOption()
    },
    searchOption() {
      this.$refs.basicTable.getData(url, { ...this.$refs.searchForm.searchParam(), 'typeId': this.typeId })
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        param.typeId = this.typeId
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 点击添加
    addOption() {
      this.operateStatus = 1
      this.updateFormData.dsType = null
      this.updateFormData.targetTypeId = null
      this.disTypeDisabled = false
      this.getAddForm()
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.updateFormData.dsType = row.dsType
      this.updateFormData.targetTypeId = row.targetTypeId
      this.disTypeDisabled = true
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      baseRequest('/basic/t00ColumnTypeConvert/getAddData', param).then(response => {
        response.data.item = {}
        const result = response.data
        // result.formConfig = JSON.parse(result.formConfig)
        delete result.selectOptions.dsType[this.row.dsType]
        this.dsType = result.selectOptions.dsType
        // this.updateFormData = result
        this.formVisible = true
        // this.$nextTick(function() {
        //   this.$refs.updateFrom.clearValidate()
        // })
      })
    },
    handleDsType(val) {
      this.updateFormData.targetTypeId = null
      baseRequest('/basic/t00ColumnType/selectOptions', { dsType: val }).then(response => {
        this.targetType = response.data.item
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      this.updateFormData.targetTypeId = row.targetTypeId + ''
      baseRequest('/basic/t00ColumnType/selectOptions', { dsType: row.dsType }).then(response => {
        this.targetType = response.data.item
        this.formVisible = true
      })
      // baseRequest('/t00ColumnTypeConvert/select', param).then(response => {
      //   const result = response.data
      //   result.formConfig = JSON.parse(result.formConfig)
      //   this.updateFormData = result
      //   this.formVisible = true
      //   this.$nextTick(function() {
      //     this.$refs.updateFrom.clearValidate()
      //   })
      // })
    },
    // 删除
    deleteForm(row) {
      const param = { dsType: row.dsType, 'typeId': this.typeId }
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/t00ColumnTypeConvert/delete', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      })
    },
    // 保存操作
    saveOperate() {
      if (this.operateStatus === 1) {
        const param = { ...this.updateFormData }
        param.typeId = this.typeId
        baseRequest('/basic/t00ColumnTypeConvert/add', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      } else if (this.operateStatus === 2) {
        const param = { ...this.updateFormData }
        param.typeId = this.typeId
        baseRequest('/basic/t00ColumnTypeConvert/update', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      }
    }
  }
}
</script>

