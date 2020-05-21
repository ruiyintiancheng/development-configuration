/*
 * @Author: M.HQ 
 * @Date: 2019-03-08 14:11:46 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-20 13:47:07
 * @Description: 元数据管理
 */
<template>
  <div class="app-container"
       style="margin-left:5px;">
    <el-row>
      <el-col :span="4"
              class="code-tree"
              :style="{height:containHeight + 'px'}">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="tree" />
            <span>元数据树</span>
          </div>
        </div>
        <el-input placeholder="筛选"
                  v-model="filterText"
                  style="padding:5px 10px;width:85%;"></el-input>
        <el-tree class="filter-tree"
                 :filter-node-method="filterNode"
                 :data="treeData"
                 :props="defaultProps"
                 default-expand-all
                 :expand-on-click-node="false"
                 @node-click="handleNodeClick"
                 empty-text=""
                 ref="tree2">
        </el-tree>
      </el-col>
      <el-col :span="20">
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
                       :inputCount="2"
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
              <el-button v-if="nodeType == 'schema'"
                         @click="loadUpdate">加载更新</el-button>
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
          <!-- 表格 -->
          <basic-table v-show="tableToggle"
                       ref="basicTable"
                       :tableOption="configData"
                       :pagenation="true"
                       :rowNum="true">
            <template slot="optionColumn">
              <el-table-column width="300px"
                               label="操作"
                               align="center"
                               fixed="right">
                <template slot-scope="scope">
                  <el-button type="primary"
                             plain
                             size="mini"
                             @click="updateOption(scope.row)">修改</el-button>
                  <el-button type="danger"
                             plain
                             size="mini"
                             @click="handleDelete(scope.row)">删除</el-button>
                  <el-button v-if="nodeType == 'schema'"
                             type="info"
                             plain
                             size="mini"
                             @click="updateColumn(scope.row)">字段维护</el-button>
                </template>
              </el-table-column>
            </template>
          </basic-table>
          <!-- 修改/添加 数据源弹窗 -->
          <el-dialog :title="sourceTitle"
                     v-el-drag-dialog
                     :close-on-click-modal="false"
                     :visible.sync="dialogSourceVisible"
                     width="80%"
                     custom-class="dialog-default">
            <div class="dialog-contant-default">
              <el-form ref="form"
                       :inline="true"
                       :model="formData"
                       class="demo-form-inline demo-table-expand">
                <table border="0"
                       style="width:90%;padding-left: 50px;">
                  <tr class="tr-height">
                    <td style="text-align: center;"><span class="input-label">数据源编码</span></td>
                    <td>
                      <el-input v-model="formData.dsCode"
                                clearable></el-input>
                    </td>
                    <td style="text-align: center;"><span class="input-label">描述</span></td>
                    <td>
                      <el-input v-model="formData.dsName"
                                clearable></el-input>
                    </td>
                  </tr>
                  <tr class="tr-height">
                    <td style="text-align: center;"><span class="input-label">数据库类型</span></td>
                    <td>
                      <el-select v-model="formData.dsType"
                                 clearable
                                 filterable
                                 placeholder=""
                                 style="width:100%;">
                        <el-option label="ORACLE"
                                   value="1"></el-option>
                        <el-option label="MYSQL"
                                   value="MYSQL"></el-option>
                        <el-option label="DB2"
                                   value="2"></el-option>
                      </el-select>
                    </td>
                    <td style="text-align: center;"><span class="input-label">服务器地址</span></td>
                    <td>
                      <el-input v-model="formData.host"
                                clearable></el-input>
                    </td>
                  </tr>
                  <tr class="tr-height">
                    <td style="text-align: center;"><span class="input-label">端口号</span></td>
                    <td>
                      <el-form-item prop="port"
                                    :rules="[{ required: true, message: '端口号不能为空'},{ type: 'number', message: '端口号必须为数字值'}]">
                        <el-input v-model.number="formData.port"
                                  clearable></el-input>
                      </el-form-item>
                    </td>
                    <td style="text-align: center;"><span class="input-label">数据库名</span></td>
                    <td>
                      <el-input v-model="formData.dbName"
                                clearable></el-input>
                    </td>
                  </tr>
                  <tr class="tr-height">
                    <td style="text-align: center;"><span class="input-label">连接用户名</span></td>
                    <td>
                      <el-input v-model="formData.dsUser"
                                clearable></el-input>
                    </td>
                    <td style="text-align: center;"><span class="input-label">连接密码</span></td>
                    <td>
                      <el-input v-model="formData.dsPassword"
                                clearable></el-input>
                    </td>
                  </tr>
                  <tr style="height:72px;">
                    <td style="text-align: center;"><span class="input-label">数据源参数</span></td>
                    <td colspan="3">
                      <el-input type="textarea"
                                v-model="formData.dsParam"
                                clearable></el-input>
                    </td>
                  </tr>
                </table>
              </el-form>
            </div>
            <div slot="footer"
                 class="dialog-footer">
              <el-button @click="dialogSourceVisible = false">取消</el-button>
              <el-button type="primary"
                         @click="dialogFormSubmit">保存</el-button>
            </div>
          </el-dialog>
          <!-- 添加/修改 用户弹窗 -->
          <el-dialog :title="sourceUserTitle"
                     v-el-drag-dialog
                     :close-on-click-modal="false"
                     :visible.sync="dialogSourceUserVisible">
            <div class="dialog-contant-default">
              <el-form ref="userForm"
                       :inline="true"
                       :model="userFormData"
                       class="demo-form-inline demo-table-expand"
                       style="margin-top:20px;">
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label">用户名</span>
                    <el-input :style="{width:'250px'}"
                              v-model="userFormData.schemaName"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label">描述</span>
                    <el-input :style="{width:'250px'}"
                              v-model="userFormData.schemaDes"
                              clearable></el-input>
                  </el-form-item>
                </div>
              </el-form>
            </div>
            <div slot="footer"
                 class="dialog-footer">
              <el-button @click="dialogSourceUserVisible = false">取消</el-button>
              <el-button type="primary"
                         @click="dialogFormSubmit">保存</el-button>
            </div>
          </el-dialog>
          <!-- 表格弹窗 -->
          <el-dialog :title="sourceTableTitle"
                     v-el-drag-dialog
                     :close-on-click-modal="false"
                     :visible.sync="dialogSourceTableVisible">
            <div class="dialog-contant-default">
              <el-form ref="tableForm"
                       :inline="true"
                       :model="tableFormData"
                       class="demo-form-inline demo-table-expand"
                       style="margin-top:20px;">
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">表名</span>
                    <el-input :style="{width:'250px'}"
                              v-model="tableFormData.tableName"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">注释</span>
                    <el-input :style="{width:'250px'}"
                              v-model="tableFormData.tableComment"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">是否做权限控制</span>
                    <el-select :style="{width:'250px'}"
                               v-model="tableFormData.permissionFlag"
                               filterable
                               clearable
                               placeholder="">
                      <el-option label="否"
                                 value="0"></el-option>
                      <el-option label="是"
                                 value="1"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">是否临时表</span>
                    <el-select :style="{width:'250px'}"
                               v-model="tableFormData.imterimFlag"
                               filterable
                               clearable
                               placeholder="">
                      <el-option label="否"
                                 value="0"></el-option>
                      <el-option label="是"
                                 value="1"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">自动刷新缓存</span>
                    <el-input :style="{width:'250px'}"
                              v-model="tableFormData.autoRefreshCache"
                              clearable
                              placeholder="多个以|分隔"></el-input>
                  </el-form-item>
                </div>
                <div class="input-both">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">操作记录方式</span>
                    <el-select :style="{width:'250px'}"
                               v-model="tableFormData.operLogType"
                               filterable
                               clearable
                               placeholder="">
                      <el-option label="无操作"
                                 value="0"></el-option>
                      <el-option label="记录日志"
                                 value="1"></el-option>
                      <el-option label="备份表"
                                 value="2"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </el-form>
            </div>
            <div slot="footer"
                 class="dialog-footer">
              <el-button @click="dialogSourceTableVisible = false">取消</el-button>
              <el-button type="primary"
                         @click="dialogFormSubmit">保存</el-button>
            </div>
          </el-dialog>
          <!-- 字段弹窗 -->
          <el-dialog :title="'字段维护'"
                     width="80%"
                     v-el-drag-dialog
                     :close-on-click-modal="false"
                     :visible.sync="dialogSourceColumnVisible"
                     custom-class="dialog-default">
            <div class="dialog-contant-default">
              <div class="base-row">
                <div class="row-botton clearfix">
                  <div class="row-title">
                    <svg-icon icon-class="search" />
                    <span>筛选查询</span>
                  </div>
                  <div class="row-option">
                    <el-button icon="el-icon-search"
                               @click="searchColumnOption"
                               type="primary">查询</el-button>
                    <el-button icon="el-icon-refresh"
                               @click="getOption">重置</el-button>
                    <a @click="searchColumnToggle=false"
                       v-if="searchToggle">
                      <svg-icon icon-class="up" />&nbsp;收起</a>
                    <a @click="searchColumnToggle=true"
                       v-else>
                      <svg-icon icon-class="down" />&nbsp;展开</a>
                  </div>
                </div>
                <search-form v-show="searchColumnToggle"
                             ref="searchColumnForm"
                             :inputCount="2"
                             :searchFormData="configColumnData"></search-form>
              </div>
              <div class="base-row">
                <div class="row-botton clearfix">
                  <div class="row-title">
                    <svg-icon icon-class="ul" />
                    <span>数据列表</span>
                  </div>
                  <div class="row-option">
                    <el-button icon="el-icon-plus"
                               @click="addColumnOption">添加</el-button>
                    <a @click="tableColumnToggle=false"
                       v-if="tableToggle">
                      <svg-icon icon-class="up" />&nbsp;收起</a>
                    <a @click="tableColumnToggle=true"
                       v-else>
                      <svg-icon icon-class="down" />&nbsp;展开</a>
                  </div>
                </div>
                <basic-table v-show="tableColumnToggle"
                             noHeight
                             ref="basicColumnTable"
                             :tableOption="configColumnData"
                             :pagenation="true"
                             :rowNum="true">
                  <template slot="optionColumn">
                    <el-table-column label="操作"
                                     align="center"
                                     fixed="right"
                                     width="200px">
                      <template slot-scope="scope">
                        <el-button type="primary"
                                   plain
                                   size="mini"
                                   @click="updateColumnData(scope.row)">修改</el-button>
                        <el-button type="danger"
                                   plain
                                   size="mini"
                                   @click="deleteColumnData(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                  </template>
                </basic-table>
              </div>
            </div>
          </el-dialog>
          <!-- 字段弹窗 -->
          <el-dialog :title="columnTitle"
                     v-el-drag-dialog
                     :close-on-click-modal="false"
                     :visible.sync="dialogColumnVisible"
                     width="65%"
                     custom-class="dialog-default">
            <div class="dialog-contant-default"
                 style="text-align:center;">
              <el-form ref="form"
                       :inline="true"
                       :model="formColumnData"
                       class="demo-form-inline demo-table-expand">
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">字段名</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.columnName"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">注释</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.columnComment"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">字段类型</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.columnType"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">字段顺序</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.columnOrder"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">字段长度</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.dataLength"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">字段精度</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.dataScale"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">允许为空</span>
                    <el-select :style="{width:'240px'}"
                               v-model="formColumnData.nullAble"
                               clearable
                               filterable
                               placeholder="">
                      <el-option label="否"
                                 value="0"></el-option>
                      <el-option label="是"
                                 value="1"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">是否主键</span>
                    <el-select :style="{width:'240px'}"
                               v-model="formColumnData.isPk"
                               clearable
                               filterable
                               placeholder="">
                      <el-option label="否"
                                 value="0"></el-option>
                      <el-option label="是"
                                 value="1"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">数据类型</span>
                    <el-select :style="{width:'240px'}"
                               v-model="formColumnData.dataType"
                               clearable
                               filterable
                               placeholder="">
                      <el-option label="输入框"
                                 value="0"></el-option>
                      <el-option label="代码"
                                 value="1"></el-option>
                      <el-option label="日期"
                                 value="3"></el-option>
                      <el-option label="单选组件"
                                 value="4"></el-option>
                      <el-option label="国际化字段"
                                 value="5"></el-option>
                      <el-option label="多选组件"
                                 value="6"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">数据类型参数</span>
                    <el-input :style="{width:'240px'}"
                              v-model="formColumnData.typeParams"
                              clearable></el-input>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item>
                    <span class="input-label"
                          style="width:120px;">元数据权限控制</span>
                    <el-select :style="{width:'240px'}"
                               v-model="formColumnData.permissionFlag"
                               clearable
                               filterable
                               placeholder="">
                      <el-option label="否"
                                 value="0"></el-option>
                      <el-option label="是"
                                 value="1"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="input-both-2">
                  <el-form-item></el-form-item>
                </div>
              </el-form>
            </div>
            <div slot="footer"
                 class="dialog-footer">
              <el-button @click="dialogColumnVisible = false">取消</el-button>
              <el-button type="primary"
                         @click="dialogFormColumnSubmit">保存</el-button>
            </div>
          </el-dialog>
        </div>
      </el-col>
    </el-row>
    <delete-dialog :paramData='paramData'
                   @deleteOperator='deleteOperator'
                   ref="deleteDialog"></delete-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
import deleteDialog from './dialog'
const treeUrl = '/basic/dataResources/getTrees'
const dataSourceUrl = '/basic/dataResources/selects'
const userUrl = '/basic/schemas/selects'
const tableUrl = '/basic/tables/getTables'
const columnUrl = '/basic/columns/getColumns'
export default {
  directives: { elDragDialog },
  name: 'systemManagementSourceManageIndex',
  components: {
    SearchForm,
    BasicTable,
    deleteDialog
  },
  data() {
    return {
      filterText: '',
      treeData: [], // 树数据
      defaultProps: { // 树对应关系
        children: 'children',
        label: 'name',
        type: 'type'
      },
      dsId: null,
      schemaId: null,
      tableId: null,
      configData: {}, // 表格数据
      configColumnData: {},
      searchToggle: true, // 查询下拉切换
      tableToggle: true,
      searchColumnToggle: true,
      tableColumnToggle: true,
      dialogSourceVisible: false,
      dialogSourceUserVisible: false,
      dialogSourceTableVisible: false,
      dialogSourceColumnVisible: false,
      dialogColumnVisible: false,
      sourceTitle: '',
      sourceUserTitle: '',
      sourceTableTitle: '',
      columnTitle: '',
      formData: {},
      userFormData: {},
      tableFormData: {},
      formColumnData: {},
      nodeType: 'dataSource',
      containHeight: null,
      paramData: [],
      deleteId: null
    }
  },
  created() {
    this.getOption()
    this.getTrees()
    this.containHeight = this.$store.state.app.containHeight - 16
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    }
  },
  methods: {
    // 点击查询
    searchOption() {
      const param = this.$refs.searchForm.searchParam()
      param.parentDictId = this.treeId
      var sourceUrl = tableUrl
      if (this.nodeType === 'dataSource') {
        sourceUrl = dataSourceUrl
      } else if (this.nodeType === 'dataSource_user') {
        sourceUrl = userUrl
      }
      this.$refs.basicTable.getData(sourceUrl, param)
    },
    searchColumnOption() {
      const param = this.$refs.searchColumnForm.searchParam()
      param.tableId = this.tableId
      param.orderBySection = 'COLUMN_ORDER,column_id'
      this.$refs.basicColumnTable.getData(columnUrl, param)
    },
    // 初始化数据
    getOption() {
      baseRequest(dataSourceUrl, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(dataSourceUrl, param)
      })
    },
    addOption() {
      if (this.nodeType === 'dataSource') {
        this.dialogSourceVisible = true
        this.sourceTitle = '新增数据源'
        this.formData = {}
      } else if (this.nodeType === 'dataSource_user') {
        this.sourceUserTitle = '新增用户'
        this.dialogSourceUserVisible = true
        this.userFormData = {}
      } else {
        this.dialogSourceTableVisible = true
        this.sourceTableTitle = '新增表'
        this.tableFormData = {}
      }
    },
    updateOption(row) {
      if (this.nodeType === 'dataSource') {
        this.sourceTitle = '修改数据源'
        baseRequest('/basic/dataResources/select', { dsId: row.dsId }).then(response => {
          this.dialogSourceVisible = true
          this.formData = response.data.item
        })
      } else if (this.nodeType === 'dataSource_user') {
        this.sourceUserTitle = '修改用户'
        baseRequest('/basic/schemas/select', { schemaId: row.schemaId }).then(response => {
          this.dialogSourceUserVisible = true
          this.userFormData = response.data.item
        })
      } else {
        this.sourceTableTitle = '修改表'
        baseRequest('/basic/tables/select', { tableId: row.tableId }).then(response => {
          this.dialogSourceTableVisible = true
          this.tableFormData = response.data.item
        })
      }
    },
    handleDelete(row) {
      const dsId = Number.isFinite(row.dsId) ? (row.dsId + '') : undefined
      const schemaId = Number.isFinite(row.schemaId) ? (row.schemaId + '') : undefined
      const tableId = Number.isFinite(row.tableId) ? (row.tableId + '') : undefined
      this.deleteId = dsId || schemaId || tableId
      // 先查询是否配置过权限或下级有没有子节点
      baseRequest('/basic/dataResources/selectPermisson', { id: this.deleteId, operation: this.nodeType }).then(response => {
        this.paramData = response.data.item
        this.$refs.deleteDialog.openDialog()
      })
    },
    deleteOperator() { // 删除操作
      if (this.nodeType === 'dataSource') {
        baseRequest('/basic/dataResources/delete', { dsId: this.deleteId }).then(response => {
          this.getOption()
          this.getTrees()
        })
      } else if (this.nodeType === 'dataSource_user') {
        baseRequest('/basic/schemas/delete', { schemaId: this.deleteId }).then(response => {
          this.getOption()
          this.getTrees()
        })
      } else {
        baseRequest('/basic/tables/delete', { tableId: this.deleteId }).then(response => {
          this.getOption()
        })
      }
    },
    addColumnOption() {
      this.columnTitle = '新增字段'
      this.dialogColumnVisible = true
      this.formColumnData = {}
    },
    updateColumnData(row) {
      baseRequest('/basic/columns/select', { columnId: row.columnId }).then(response => {
        this.columnTitle = '修改字段'
        this.dialogColumnVisible = true
        this.formColumnData = response.data.item
      })
    },
    deleteColumnData(row) {
      this.$confirm('此操作将永久删除该记录,是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        baseRequest('/basic/columns/delete', { columnId: row.columnId }).then(response => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    dialogFormColumnSubmit() {
      this.formColumnData.tableId = this.tableId
      baseRequest('/basic/columns/add', this.formColumnData).then(response => {
        this.dialogColumnVisible = false
        this.searchColumnOption()
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
        this.getTrees()
      })
    },
    updateColumn(row) { // 字段维护
      this.tableId = row.tableId
      baseRequest(columnUrl, { urlMode: '1' }).then(response => {
        this.dialogSourceColumnVisible = true
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configColumnData = result
        this.$nextTick(() => {
          this.searchColumnOption()
        })
      })
    },
    getTrees() {
      baseRequest(treeUrl).then(response => {
        this.treeData = response.data.item
      })
    },
    // 重置
    reset() {
      this.$refs.searchForm.resetForm()
    },
    dialogFormSubmit() {
      if (this.nodeType === 'dataSource') {
        baseRequest('/basic/dataResources/add', this.formData).then(response => {
          this.dialogSourceVisible = false
          this.searchOption()
          this.getTrees()
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        })
      } else if (this.nodeType === 'dataSource_user') {
        this.userFormData.dsId = this.dsId
        baseRequest('/basic/schemas/add', this.userFormData).then(response => {
          this.dialogSourceUserVisible = false
          this.searchOption()
          this.getTrees()
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        })
      } else {
        this.tableFormData.schemaId = this.schemaId
        baseRequest('/basic/tables/add', this.tableFormData).then(response => {
          this.dialogSourceTableVisible = false
          this.searchOption()
          this.getTrees()
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        })
      }
    },
    // 点击树切换数据
    handleNodeClick(data) {
      const type = data.type
      this.nodeType = type
      if (type === 'dataSource') {
        this.dsId = data.id
        if (data.id === -1) { // 点击元数据
          // 查询所有的数据源信息
          this.getOption()
        } else { // 根据数据源查询所有用户信息
          this.nodeType = 'dataSource_user'
          baseRequest(userUrl, { urlMode: '1' }).then(response => {
            const result = response.data
            result.formConfig = JSON.parse(result.formConfig)
            result.tableConfig = JSON.parse(result.tableConfig)
            this.configData = result
            const param = getSearchParam(result.formConfig)
            param.dsId = data.id
            param.orderBySection = 'add_time,schema_Id'
            this.$refs.basicTable.getData(userUrl, param)
          })
        }
      } else if (type === 'schema') { // 根据用户id查询所有的表格
        this.schemaId = data.id
        baseRequest(tableUrl, { urlMode: '1' }).then(response => {
          const result = response.data
          result.formConfig ? result.formConfig = JSON.parse(result.formConfig) : ''
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          param.schemaId = this.schemaId
          param.orderBySection = 'add_time,table_Id'
          this.$refs.basicTable.getData(tableUrl, param)
        })
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    loadUpdate() {
      // 加载更新
      const param = { schemaId: this.schemaId }
      baseRequest('/basic/tables/loadUpdate', param).then(response => {
        this.$message({
          type: 'success',
          message: '保存成功!'
        })
      })
    }
  }
}
</script>
<style scoped>
.code-tree {
  margin-top: 5px;
  overflow: auto;
  position: relative;
  border: 1px solid #e4e4e4;
}
.form-search {
  padding: 17px 24px 0px 24px;
}
.demo-form-inline {
  width: 100%;
  display: inline-block;
}
.input-both {
  height: 52px;
  width: 100%;
  text-align: center;
}
.input-both-1 {
  height: 70px;
  width: 90%;
  display: inline-block;
}
.input-both-2 {
  height: 52px;
  width: 45%;
  display: inline-block;
}
.form-input {
  width: 250px;
}
.form-input-range {
  width: 117.35px;
  font-size: 12px;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
}
.input-label {
  width: 89px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}
.input-label-range {
  width: 7px;
  margin: 0;
}
.tr-height {
  height: 52px;
}
</style>