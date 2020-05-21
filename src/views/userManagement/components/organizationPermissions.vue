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
                <el-date-picker type="date"
                                popper-class='only-has-hour'
                                placeholder="选择日期"
                                v-model="form.date1"
                                style="width: 100%;"></el-date-picker>
              </el-form-item>
              <el-form-item label="失效时间">
                <el-date-picker type="date"
                                popper-class='only-has-hour'
                                placeholder="选择日期"
                                v-model="form.date2"
                                style="width: 100%;"></el-date-picker>
              </el-form-item>
            </el-form>
            <div style="text-align: center; margin: 0">
              <el-button size="mini"
                         type="text"
                         @click="visible2 = false">取消</el-button>
              <el-button type="primary"
                         size="mini"
                         @click="visible2 = false">确定</el-button>
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
                   max-height="100%"
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="false"
                   :rowCheck="true"
                   noHeight>
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
        <el-tree :data="treeData"
                 :props="defaultProps"
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
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
const url = '/basic/roleManagementOrganizationPermissions/selects'
export default {
  directives: { elDragDialog },
  name: 'roleManagementComponentsOrganizationPermissions',
  components: {
    SearchForm,
    BasicTable
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
        1: '添加',
        2: '修改',
        3: '语言设置'
      },
      visible2: false,
      form: {
        date1: '',
        date2: ''
      },
      treeData: [
        {
          label: '总行',
          children: [
            {
              label: '北京分行',
              children: [
                {
                  label: '北京分行上地支行'
                },
                {
                  label: '北京分行知春路支行'
                }
              ]
            },
            {
              label: '天津分行',
              children: [
                {
                  label: '营业部'
                },
                {
                  label: '支付'
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
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
      baseRequest(url).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 修改
    updateRole() {
      this.operateStatus = 1
      this.formVisible = true
    },
    // 资源删除
    handleDelete() {
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/submitted/delete').then(request => {
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

