/*
  查询组件
  wlq
  2019/9/3
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
                         fixed="right"
                         width="180">
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
    <!-- 添加/修改 -->
    <el-dialog :title="dialogTitle[operateStatus]"
               :visible.sync="formVisible"
               :close-on-click-modal='false'
               v-el-drag-dialog
               width="60%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <el-form ref="form"
                 :model="item"
                 label-position="left"
                 label-width="100px"
                 class="baseUpdate-form">
          <el-form-item prop="componentDesc"
                        label="组件描述"
                        :rules="[{required: true, message: '数据不能为空', trigger: 'blur'}]">
            <el-input class="form-input"
                      v-model="item.componentDesc"
                      clearable></el-input>
          </el-form-item>
          <el-form-item prop="resourceDesc"
                        label="资源描述"
                        :rules="[{required: true, message: '数据不能为空', trigger: 'blur'}]">
            <el-input class="form-input"
                      v-model="item.resourceDesc"
                      :disabled="true"
                      clearable></el-input>
            <el-button icon="el-icon-plus"
                       @click="selectResource">选择资源</el-button>
          </el-form-item>
          <el-form-item prop="componentType"
                        label="组件类型"
                        :rules="[{required:true,message:'数据不能为空', trigger: 'change'}]">
            <el-select class="form-input"
                       v-model="item.componentType"
                       clearable>
              <el-option value="1"
                         label="下拉框"></el-option>
              <el-option value="2"
                         label="列表"></el-option>
              <el-option value="3"
                         label="树形下拉框"></el-option>
              <el-option value="4"
                         label="穿梭框"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="selectType"
                        label="选择类型"
                        :rules="[{required: true, message: '数据不能为空', trigger: 'change'}]">
            <el-select class="form-input"
                       v-model="item.selectType"
                       clearable>
              <el-option value="1"
                         label="单选"></el-option>
              <el-option value="2"
                         label="多选"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveItem">保存</el-button>
      </div>
    </el-dialog>
    <!-- 资源选择 -->
    <el-dialog title="资源选择"
               :visible.sync="resourceVisible"
               :close-on-click-modal='false'
               v-el-drag-dialog
               width="60%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <table-form v-if="operateStatus!==3"
                    ref="tableForm"></table-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="resourceVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveResource">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
// import RC from '../userManagement/components/resourceConnection'
import tableForm from './form'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/t00VueComponent/selects'
export default {
  name: 'queryComponentIndex',
  components: {
    SearchForm,
    BasicTable,
    tableForm
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      resourceVisible: false, // 资源弹框开关
      operateStatus: null, // 操作选项
      paramId: null, // 修改保存参数id
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      },
      item: {
        componentId: null, // 组件id
        resourceId: null, // 资源id
        resourceDesc: null, // 组建描述
        componentDesc: null, // 组件描述
        componentType: null, // 组件类型
        selectType: null // 选择类型
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
      this.formVisible = true
      this.item.componentId = null
      this.item.resourceId = null
      this.item.resourceDesc = null
      this.item.componentDesc = null
      this.item.componentType = null
      this.item.selectType = null
    },
    updateOption(row) { // 修改表单
      baseRequest('/basic/t00VueComponent/select', { componentId: row.componentId }).then(response => {
        this.operateStatus = 2
        this.formVisible = true
        this.item = response.data.item
        this.item.componentType = response.data.item.componentType + ''
        this.item.resourceDesc = row.resourceDesc
      })
    },
    selectResource() { // 选择资源
      this.resourceVisible = true
      this.$refs.tableForm.clearOption()
    },
    // 获取添加表单
    getAddForm() {
      const param = { urlMode: 1 }
      baseRequest('/basic/resourceParams/getAddData', param).then(response => {
        response.data.item = {}
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          // this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = { paramId: row.paramId }
      baseRequest('/basic/resourceParams/select', param).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          // this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 删除
    deleteForm(row) {
      const param = { componentId: row.componentId }
      this.$confirm('此操作将永久删除该条数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/t00VueComponent/delete', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      })
    },
    // 提交表单
    saveItem() {
      if (this.operateStatus === 1) { // 添加
        const param = { ...this.item }
        param.resourceId = parseInt(this.item.resourceId)
        param.componentType = parseInt(this.item.componentType)
        baseRequest('/basic/t00VueComponent/add', param).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      } else if (this.operateStatus === 2) { // 修改
        baseRequest('/basic/t00VueComponent/update', this.item).then(response => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      }
    },
    // 资源选择
    saveResource() {
      this.resourceVisible = false
      const resource = this.$refs.tableForm.getOption()
      this.item.resourceId = resource.resourceId
      this.item.resourceDesc = resource.resourceDesc
    }
  }
}
</script>

