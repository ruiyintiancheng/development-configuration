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
                         width="200"
                         fixed="right">
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
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <update-form v-if="operateStatus!==3"
                     ref="updateFrom"
                     :updateFormData="updateFormData">
        </update-form>
        <el-form ref="form"
                 :model="item"
                 label-position="left"
                 label-width="100px"
                 style='margin-left:calc(50% - 125px)'>
          <el-form-item prop="msgText"
                        label="默认信息"
                        :rules="[{required:true,message:'默认信息不能为空'}]"
                        :error="error.msgText">
            <el-input class="form-input"
                      v-model="item.msgText"
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
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/validates/selects'
export default {
  name: 'validatesIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm
  },
  data() {
    return {
      item: {
        msgText: ''
      },
      error: {
        msgText: ''
      },
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      defId: null, // 修改保存参数id
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
      this.defId = row.defId
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      baseRequest('/basic/validates/getAddData', param).then(response => {
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.form.resetFields()
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = { defId: row.defId }
      baseRequest('/basic/validates/getValidateDefAndMsgText', param).then(response => {
        const result = response.data
        this.item.msgText = result.item.msgText
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
      const param = { defId: row.defId }
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/validates/delete', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      }).catch(() => {

      })
    },
    // 保存操作
    saveOperate() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.operateStatus === 1) {
            const param = this.$refs.updateFrom.formData
            param.msgText = this.item.msgText
            this.$refs.updateFrom.saveRequest('/validates/addByMap').then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          } else if (this.operateStatus === 2) {
            const param = this.$refs.updateFrom.getFormData()
            param.msgText = this.item.msgText
            param.defId = this.defId
            this.$refs.updateFrom.saveRequest('/validates/updateByMap', param).then(() => {
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

