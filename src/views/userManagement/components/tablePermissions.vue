/*
 * @Author: M.HQ 
 * @Date: 2019-03-05 09:45:22 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-20 13:55:19
 * @Description: 表格权限
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
                     @click="reserch">重置</el-button>
          <a @click="searchToggle=false"
             v-if="searchToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="searchToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <el-form :model="data"
               inline
               style="margin:20px 0 0 20px;">
        <el-form-item label="表名:">
          <el-input class="form-input"
                    v-model="data.tableName"></el-input>
        </el-form-item>
        <el-form-item label="用户:">
          <el-cascader class="form-input"
                       :options="options"
                       @active-item-change="handleItemChange"
                       :props="cascadeProps"
                       v-model="data.cascadeData"></el-cascader>
        </el-form-item>
      </el-form>
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
                     @click="updateRole">添加</el-button>
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
        <template slot="optionColumn">
          <el-table-column label="操作"
                           align="center"
                           width="100"
                           fixed="right">
            <template slot-scope="scope">
              <el-button type="primary"
                         plain
                         size="mini"
                         @click="columnPermissions(scope.row)">字段授权</el-button>
            </template>
          </el-table-column>
        </template>
      </basic-table>
    </div>
    <column-permission ref="addColumnPermission"
                       :paramData='paramData'></column-permission>
    <!-- 表格权限添加 -->
    <AT ref="addTablePermission"
        @searchOption="searchOption"
        :paramData='paramData'></AT>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
import AT from './addTablePermissions'
import columnPermission from './columnPermissions'
const url = '/basic/permissions/getPermissionTableList'
export default {
  directives: { elDragDialog },
  name: 'roleManagementComponentsTablePermissions',
  components: {
    SearchForm,
    BasicTable,
    AT,
    columnPermission
  },
  props: {
    paramData: {
      type: [Object, Array]
    }
  },
  data() {
    return {
      data: {
        tableName: '',
        cascadeData: []
      },
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '字段授权',
        3: '语言设置'
      },
      visible2: false,
      form: {},
      options: [],
      cascadeProps: {
        value: 'ID',
        label: 'LABEL',
        children: 'children'
      }
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    reserch() {
      this.data = { tableName: '', cascadeData: [] }
      this.searchOption()
    },
    searchOption() {
      const param = {
        tableName: this.data.tableName
      }
      if (this.data.cascadeData.length === 1) {
        param.dsId = this.data.cascadeData[0]
      }
      if (this.data.cascadeData.length === 2) {
        param.schemaId = this.data.cascadeData[1]
      }
      param.permissionId = this.paramData.permissionId
      param.userId = this.paramData.userId || null
      param.roleId = this.paramData.roleId || null
      this.$refs.basicTable.getData(url, param)
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        // result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(() => {
          this.searchOption()
        })
      })

      this.getCascadeSelect(null, function(data) {
        for (var i = 0; i < data.length; i++) {
          data[i].children = []
        }
        this.options = data
      }.bind(this))
    },
    getCascadeSelect(param, callback) {
      // 获取用户下拉选
      baseRequest('/basic/tables/getCascadeSelect', param).then(response => {
        callback && callback(response.data.item)
      })
    },
    handleItemChange(val) {
      this.data.cascadeData = val
      const param = {}
      if (val.length === 1) {
        param.dsId = val[0]
      }
      // if (val.length === 2) {
      //   param.schemaId = val[1]
      // }
      //       if(val.length === 3){
      // param.tableId = val[2]
      //       }
      this.getCascadeSelect(param, function(data) {
        if (val.length === 1) {
          // for (var i = 0; i < data.length; i++) {
          //   data[i].children = []
          // }
          this.options[val[0]].children = data
        }
        // if (val.length === 2) {
        //   param.schemaId[val[0]][val[1]].children = data
        // }
      }.bind(this))
    },
    // 修改
    updateRole() {
      this.$refs.addTablePermission.openDialog()
    },
    // 字段授权
    columnPermissions(row) {
      this.paramData.tableId = row.table_id
      this.$refs.addColumnPermission.openDialog()
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
        checkedArr.push(checkeds[index].table_id)
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
        checkedArr.push(checkeds[index].table_id)
      }
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          paramConvertMap: { permissionValue: checkedArr },
          permissionValue: 'null',
          roleId: this.paramData.roleId,
          userId: this.paramData.userId,
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
    }
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 380
    }
  }
}
</script>

