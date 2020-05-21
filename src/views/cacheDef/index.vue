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
          <!-- <el-button icon="el-icon-plus" @click="addOption" >刷新缓存</el-button> -->
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
                         width="250"
                         fixed="right">
          <template slot-scope="scope">
            <el-button type="info"
                       plain
                       size="mini"
                       @click="flushCache(scope.row)">刷新</el-button>
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="success"
                       plain
                       size="mini"
                       @click="showOne(scope.row)">查看</el-button>
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
                     :updateFormData="updateFormData"></update-form>
        <el-form ref="form"
                 :model="item"
                 label-position="left"
                 label-width="100px"
                 class="baseUpdate-form">
          <el-form-item prop="loadType"
                        label="加载方式"
                        :error="error.loadType"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="item.loadType"
                       clearable>
              <el-option value="1"
                         label="启动加载"></el-option>
              <el-option value="2"
                         label="访问加载"></el-option>
              <el-option value="3"
                         label="手动加载 "></el-option>
              <el-option value="4"
                         label="用户缓存"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="!item.loadType || item.loadType !== '3'"
                        prop="loadClass"
                        label="加载类"
                        :error="error.loadClass"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-input class="form-input"
                      v-model="item.loadClass"
                      clearable>
            </el-input>
          </el-form-item>
          <el-form-item v-if="!item.loadType || item.loadType !== '3'"
                        prop="loadMethod"
                        label="加载方法"
                        :error="error.loadMethod"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-input class="form-input"
                      v-model="item.loadMethod"
                      clearable>
            </el-input>
          </el-form-item>
          <el-form-item prop="expiredType"
                        label="过期类型"
                        :error="error.expiredType"
                        :rules="[{required:true,message:'数据不能为空'}]">
            <el-select class="form-input"
                       v-model="item.expiredType"
                       clearable>
              <el-option value="0"
                         label="不过期"></el-option>
              <el-option value="1"
                         label="闲置过期"></el-option>
              <el-option value="2"
                         label="固定时间 "></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="!item.expiredType || item.expiredType !== '0'"
                        prop="activeTime"
                        label="过期时间（秒）">
            <el-input class="form-input"
                      v-model="item.activeTime"
                      clearable>
            </el-input>
          </el-form-item>
          <el-form-item prop="cacheDesc"
                        label="缓存描述">
            <el-input class="form-input"
                      type="textarea"
                      :rows="3"
                      v-model="item.cacheDesc"
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
    <el-dialog title="缓存详情"
               :visible.sync="dialogPreviewSwitch"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <json-editor ref="jsonEditor"
                     v-model="previewData"></json-editor>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogPreviewSwitch = false">关闭</el-button>
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
import JsonEditor from '@/components/JsonEditor'
const url = '/basic/caches/listCache'
export default {
  name: 'cacheDefIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    JsonEditor
  },
  data() {
    return {
      item: {
        loadType: '',
        loadClass: '',
        loadMethod: '',
        expiredType: '',
        activeTime: '',
        cacheDesc: ''
      },
      error: {
        loadType: '',
        loadClass: '',
        loadMethod: '',
        expiredType: '',
        activeTime: '',
        cacheDesc: ''
      },
      validator: (rule, value, callback) => {
        if (/^\d+$/.test(value)) {
          callback()
        } else {
          callback(new Error('数据必须是数字'))
        }
      },
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: null, // 弹框数据
      formVisible: false, // 弹框开关
      previewData: null, // 预览数据
      dialogPreviewSwitch: false,
      operateStatus: null, // 操作选项
      cacheId: null, // 修改保存参数id
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
      this.cacheId = row.cacheId
      this.getUpdateForm(row)
    },
    // 获取添加表单
    getAddForm() {
      for (const key in this.item) {
        this.item[key] = null
      }
      const param = { urlMode: 1 }
      baseRequest('/basic/caches/getAddData', param).then(response => {
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
      const param = { cacheId: row.cacheId }
      baseRequest('/basic/caches/select', param).then(response => {
        const result = response.data
        this.item.loadType = result.item.loadType
        this.item.loadClass = result.item.loadClass
        this.item.loadMethod = result.item.loadMethod
        this.item.expiredType = result.item.expiredType
        this.item.activeTime = result.item.activeTime
        this.item.cacheDesc = result.item.cacheDesc
        result.formConfig = JSON.parse(result.formConfig)
        this.updateFormData = result
        this.formVisible = true
        this.$nextTick(function() {
          this.clearError()
          this.$refs.updateFrom.clearValidate()
        })
      })
    },
    // 展示
    showOne(row) {
      const param = { cacheKey: row.cacheKey }
      baseRequest('/basic/caches/getCacheData', param).then(response => {
        this.previewData = JSON.stringify(response.data)
        this.previewData = JSON.parse(this.previewData)
        this.dialogPreviewSwitch = true
      })
    },

    // 刷新缓存
    flushCache(row) {
      const param = { cacheKey: row.cacheKey }
      param.loadType = row.loadType
      this.$confirm('此操作将刷新缓存, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/caches/flushCacheByCacheKey', param).then(response => {
          this.searchOption()
          this.$Message.success('刷新成功')
        })
      })
    },
    // 保存操作
    saveOperate() {
      this.clearError()
      this.$refs.form.validate((valid) => {
        if (valid) {
          const param = this.$refs.updateFrom.getFormData()
          param.loadType = this.item.loadType
          param.loadClass = this.item.loadClass
          param.loadMethod = this.item.loadMethod
          param.expiredType = this.item.expiredType
          param.activeTime = this.item.activeTime
          param.cacheDesc = this.item.cacheDesc
          if (this.operateStatus === 1) {
            this.$refs.updateFrom.saveRequest('/caches/addCache').then(() => {
              this.searchOption()
              this.$Message.success('操作成功')
              this.formVisible = false
            }, (validateMsg) => {
              this.validateElseItem(validateMsg)
            })
          } else if (this.operateStatus === 2) {
            const param = this.$refs.updateFrom.getFormData()
            param.cacheId = this.cacheId
            this.$refs.updateFrom.saveRequest('/caches/update', param).then(() => {
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
