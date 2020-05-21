<template>
  <div class="app-container calendar-list-container resource-option">
    <base-input type="text"
                :placeholder="$t('resource.urlFuzzyQuery')"
                v-model="listParam.resourceUrl"
                label="URL"
                @keyup.enter.native="handleFilter"></base-input>
    <base-input type="text"
                :placeholder="$t('resource.descFuzzyQuery')"
                v-model="listParam.resourceDesc"
                :label="$t('resource.resourceDesc')"
                @keyup.enter.native="handleFilter"></base-input>
    <base-input type="select"
                placeholder="配置类型"
                :selects="configModeOption"
                v-model="listParam.configMode"
                :label="$t('resource.configMode')"></base-input>
    <el-button class="filter-item"
               type="primary"
               v-waves
               icon="el-icon-search"
               @click="handleFilter">{{$t('resource.search')}}</el-button>
    <el-button class="filter-item"
               plain
               icon="el-icon-plus"
               @click="handleOperate()">{{$t('resource.add')}}</el-button>
    <!-- <el-button  class="filter-item" plain  icon="el-icon-plus" @click="handleAddResource()">新增资源</el-button> -->
    <el-table v-loading="listLoading"
              element-loading-text="给我一点时间"
              :data="list"
              border
              fit
              highlight-current-row
              stripe
              :height="tableHeight"
              style="width: 100%;margin-top:10px;">
      <el-table-column label="URL"
                       align="center">
        <template slot-scope="scope">
          <span>{{scope.row['resourceUrl']}}</span>
        </template>
      </el-table-column>
      <el-table-column width=200
                       :label="$t('resource.resourceType')"
                       align="center">
        <template slot-scope="scope">
          <span>{{scope.row.field_convert_map.resourceType}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('resource.resourceDesc')"
                       align="center">
        <template slot-scope="scope">
          <span>{{scope.row.resourceDesc}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       :label="$t('resource.operation')"
                       fixed="right"
                       width="300">
        <template slot-scope="scope">
          <el-button type="info"
                     plain
                     @click="handleDeploy(scope.row.resourceId)"
                     size="mini">{{$t('resource.allocation')}}</el-button>
          <el-button type="primary"
                     plain
                     @click="handleUpdate(scope.row)"
                     size="mini">{{$t('resource.update')}}</el-button>
          <el-button type="danger"
                     @click="handleDelete(scope.row)"
                     plain
                     size="mini">{{$t('resource.delete')}}</el-button>
          <el-button type="success"
                     plain
                     @click="handlePreview(scope.row)"
                     size="mini">{{$t('resource.preview')}}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="listParam.pageNo"
                     :page-sizes="[10,20,30, 50]"
                     :page-size="listParam.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="textMap[dialogStatus]+'- JAVA配置 - '+textMapDetail[dialogForm]"
               :visible.sync="dialogFormVisible"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="70%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <template v-if="dialogForm===1">
          <el-form :rules="rulesOne"
                   ref="optionParamOne"
                   :model="optionParam"
                   label-position="left"
                   label-width="100px"
                   style='width: 300px; margin:auto;'>
            <el-form-item label="URL"
                          prop="resourceUrl">
              <base-input ref='resourceUrl'
                          type="text"
                          v-model="optionParam.resourceUrl"></base-input>
            </el-form-item>
            <el-form-item label="资源描述"
                          prop="resourceDesc">
              <base-input ref='resourceDesc'
                          type="text"
                          v-model="optionParam.resourceDesc"></base-input>
            </el-form-item>
            <el-form-item label="资源类型"
                          prop="resourceType">
              <base-input ref='resourceType'
                          type="select"
                          v-model="optionParam.resourceType"
                          :selects="typeOptions"></base-input>
            </el-form-item>
            <el-form-item label="数据权限"
                          prop="permissionFlag">
              <base-input ref='permissionFlag'
                          type="select"
                          v-model="optionParam.permissionFlag"
                          :selects="permissionFlag"></base-input>
            </el-form-item>
            <template v-if="configMode === '1'">
              <el-form-item label="class"
                            prop="resourceClass">
                <base-input ref='resourceClass'
                            :disabled="dialogStatus === 'update'"
                            type="text"
                            v-model="optionParam.resourceClass"></base-input>
              </el-form-item>
              <el-form-item label="method"
                            prop="resourceMethod">
                <base-input ref='resourceMethod'
                            :disabled="dialogStatus === 'update'"
                            type="text"
                            v-model="optionParam.resourceMethod"></base-input>
              </el-form-item>
            </template>
            <el-form-item v-else-if="configMode === '2'"
                          label="sql"
                          prop="querySql">
              <base-input ref='querySql'
                          :disabled="dialogStatus === 'update'"
                          type="textarea"
                          :rows="6"
                          v-model="optionParam.querySql"></base-input>
            </el-form-item>
          </el-form>
        </template>
        <template v-else-if="dialogForm===2">
          <tree-table ref="treeTable"
                      :configMode="configMode"
                      :dialogStatus="dialogStatus"
                      :paramTable="paramTable"
                      :data="paramTree"
                      :parameterType1="parameterType"
                      border></tree-table>
        </template>
        <template v-else-if="dialogForm===3">
          <tree-mapping :mappingTreeData="mappingTreeData"
                        :data="mappingData"
                        border></tree-mapping>
        </template>
        <template v-else-if="dialogForm===4">
          <tree-table ref="treeTableReturn"
                      :configMode="configMode"
                      :dialogStatus="dialogStatus"
                      :paramTable="returnTable"
                      :data="returnTree"
                      :parameterType1="returnType"
                      border></tree-table>
        </template>
        <template v-else-if="dialogForm===5">
          <tree-mapping :mappingTreeData="mappingTreeDataReturn"
                        :data="mappingDataReturn"
                        border></tree-mapping>
        </template>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogForm === 1 && dialogStatus === 'create'"
                   type="primary"
                   @click="quickComplete()">完成</el-button>
        <el-button v-if="dialogForm > 1"
                   @click="dialogBefore()">上一步</el-button>
        <el-button v-if="dialogForm !== 5"
                   @click="dialogSubmit()"
                   type="primary">下一步</el-button>
        <el-button v-else
                   @click="dialogSubmit()"
                   type="primary">完成</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]+'- 单表配置 - '+textMapDetail[dialogForm]"
               :visible.sync="dialogFormSinge"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="70%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <singe-table :dialogStatus="dialogStatus"
                     :dialogForm="dialogForm"
                     ref="singeTable"
                     v-on:changeDialogForm="changeDialogForm"
                     v-on:closeMask="closeMask"></singe-table>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormSinge = false">取消</el-button>
        <el-button v-if="dialogForm > 1"
                   @click="singleBefore()">上一步</el-button>
        <el-button v-if="dialogForm !== 4"
                   @click="singleTbClick()"
                   type="primary">下一步</el-button>
        <el-button v-else
                   type="primary"
                   @click="singleTbClick()">完成</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]+' - sql配置 -'+sqlTitle"
               :visible.sync="dialogFormSql"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="70%"
               custom-class="dialog-default">
      <sql-table :dialogStatus="dialogStatus"
                 ref="sqlTable"
                 v-on:closeMask="closeMask"
                 v-on:changeSqlTitle="changeSqlTitle"></sql-table>
    </el-dialog>
    <deploy ref="deploy"></deploy>
    <el-dialog title="预览"
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
    <!-- 新增资源弹框 -->
    <el-dialog title="新增资源"
               :visible.sync="dialogFormNewResource"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="50%"
               custom-class="dialog-default2">
      <div class="dialog-contant-default2">
        <el-form ref="newResource"
                 :rules="newResourceRules"
                 :model="newResource"
                 label-position="left"
                 label-width="100px"
                 style='width: 300px; margin:auto;'>
          <el-form-item label="表名"
                        prop="tableName">
            <el-input v-model="newResource.tableName"
                      style="width:155px;"></el-input>
          </el-form-item>
          <el-form-item label="资源URL"
                        prop="resourceUrl">
            <el-input v-model="newResource.resourceUrl"
                      style="width:155px;"></el-input>
          </el-form-item>
          <el-form-item label="字段名称"
                        prop="columnNames">
            <el-input placeholder="多个以逗号分隔"
                      type="textarea"
                      style="width: 300px;"
                      :rows="6"
                      v-model="newResource.columnNames"></el-input>
          </el-form-item>
          <el-form-item label="表注释"
                        prop="tableDesc">
            <el-input v-model="newResource.tableDesc"
                      style="width:155px;"></el-input>
          </el-form-item>
          <el-form-item label="资源描述"
                        prop="resourceDesc">
            <el-input v-model="newResource.resourceDesc"
                      style="width:155px;"></el-input>
          </el-form-item>
        </el-form>
        <div style='width: 500px; margin:auto;background-color:#F3F3F3;border:1px solid #b4bccc'>
          <p style="line-height:20px;text-indent:10px;">自动新增表,多个以逗号分隔</p>
          <p style="line-height:20px;text-indent:10px;">所有字段加参数和返回值</p>
          <p style="line-height:20px;text-indent:10px;">字段名可以是中文,在添加表单\列表时 label可以为空,将使用字段名作为label</p>
        </div>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormNewResource = false">取消</el-button>
        <el-button type="primary"
                   @click="saveAddResource()">完成</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BaseInput from '../../components/BaseInput'
import TreeTable from './components/TreeTable'
import TreeMapping from './components/TreeMapping'
import SingeTable from './components/SingeTable'
import SqlTable from './components/SqlTable'
import Deploy from './components/Deploy'
import waves from '@/directive/waves'
import JsonEditor from '@/components/JsonEditor'
// import { getParams, getTableFeild, addResource } from '@/api/resources'
import { baseSearchList, baseRequest } from '@/api/base'
import { deepClone } from '@/utils/index'

export default {
  name: 'resourcesIndex',
  directives: {
    waves
  },
  components: {
    BaseInput,
    TreeTable,
    TreeMapping,
    SingeTable,
    Deploy,
    SqlTable,
    JsonEditor
  },
  data() {
    return {
      listParam: {
        resourceUrl: '',
        resourceDesc: '',
        configMode: '1',
        pageNo: 1
      },
      total: null,
      listLoading: false,
      list: [],
      dialogForm: 1,
      dialogFormVisible: false,
      dialogFormSinge: false,
      dialogFormSql: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '添加'
      },
      textMapDetail: {
        1: '基本属性',
        2: '参数选择',
        3: '参数映射',
        4: '返回值选择',
        5: '返回值映射'
      },
      typeOptions: {
        '0': '系统资源',
        '1': '功能资源',
        '2': '无Token验证'
      },
      permissionFlag: {
        '0': '无权限',
        '1': '有权限'
      },
      configModeOption: {
        '1': 'JAVA解析',
        '2': 'SQL解析',
        '3': '单表查询'
      },
      configMode: '',
      optionParam: {
        resourceId: '',
        resourceUrl: '',
        resourceDesc: '',
        resourceClass: '',
        resourceMethod: '',
        resourceType: '',
        permissionFlag: '',
        querySql: ''
      },
      rulesOne: {
        resourceUrl: [
          { required: true, message: '请输入URL', trigger: 'blur' }
        ],
        resourceDesc: [
          { required: true, message: '请输入资源描述', trigger: 'blur' }
        ],
        resourceClass: [
          { required: true, message: '请输入class', trigger: 'blur' }
        ],
        resourceMethod: [
          { required: true, message: '请输入method', trigger: 'blur' }
        ],
        resourceType: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ],
        permissionFlag: [
          { required: true, message: '请选择数据权限', trigger: 'change' }
        ],
        querySql: [
          { required: true, message: '请输入sql', trigger: 'blur' }
        ]
      },
      paramTree: [],
      paramTable: [],
      parameterType: '',
      returnTree: [],
      returnTable: [],
      returnType: '',
      tablesParam: [],
      tablesReturn: [],
      mappingData: [],
      mappingDataReturn: [],
      mappingTreeData: [],
      mappingTreeDataReturn: [],
      multipleSelection: [],
      dialogPreviewSwitch: false,
      previewData: null,
      sqlTitle: '基本设置',
      dialogFormNewResource: false, // 新增资源弹框
      newResource: { // 新增资源数据
        tableName: null,
        resourceUrl: null,
        columnNames: null,
        tableDesc: null,
        resourceDesc: null
      },
      newResourceRules: {
        tableName: [
          { required: true, message: '请输入表名', trigger: 'blur' }
        ],
        resourceUrl: [
          { required: true, message: '请输入资源URL', trigger: 'blur' }
        ],
        columnNames: [
          { required: true, message: '请输入字段名称', trigger: 'blur' }
        ],
        tableDesc: [
          { required: true, message: '请输入表注释', trigger: 'blur' }
        ],
        resourceDesc: [
          { required: true, message: '请输入资源描述', trigger: 'blur' }
        ]
      },
      preUpdateItem: null
    }
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.containHeight - 120
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      baseSearchList(this.listParam, '/basic/resource/getList').then(response => {
        this.list = response.data.item
        this.total = response.data.total
        this.listParam.pageSize = response.data.pageSize ? response.data.pageSize : null
      })
    },
    handleFilter() {
      this.listParam.pageNo = 1
      this.getData()
    },
    handleSizeChange(val) {
      this.listParam.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.listParam.pageNo = val
      this.getData()
    },
    handleOperate() {
      if (!this.listParam.configMode) {
        this.$Message.error('请选择类型')
        return
      }
      this.configMode = this.listParam.configMode
      this.dialogForm = 1
      this.dialogStatus = 'create'
      this.updateResourceId = null
      if (this.configMode === '2') {
        this.dialogFormSql = true
        this.$nextTick(function() {
          this.$refs.sqlTable.resetForm()
        })
      } else if (this.configMode === '3') {
        this.dialogFormSinge = true
        this.$nextTick(function() {
          this.$refs.singeTable.resetForm()
        })
      } else {
        this.dialogFormVisible = true
        this.resetForm()
      }
    },
    // 资源删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = { resourceId: row.resourceId }
        baseRequest('/basic/resource/deleteResource', param).then(request => {
          this.handleFilter()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // })
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.configMode = row.configMode
      // this.configMode = '3'
      this.updateResourceId = row.resourceId
      this.dialogForm = 1
      this.resetForm()
      if (this.configMode === '2') {
        this.dialogFormSql = true
        this.$nextTick(function() {
          this.$refs.sqlTable.resetForm(row.resourceId)
        })
      } else if (this.configMode === '3') {
        this.dialogFormSinge = true
        this.$nextTick(function() {
          this.$refs.singeTable.resetForm(row.resourceId)
        })
      } else {
        this.dialogFormVisible = true
        const param = { resourceId: this.updateResourceId }
        baseRequest('/basic/resource/beforeUpdate', param).then(response => {
          const item = response.data.item
          this.preUpdateItem = {
            params: deepClone(item.menuParam),
            returns: deepClone(item.menuReturn)
          }
          const updateParam =
          { 'resourceId': item.resourceId,
            'resourceUrl': item.resourceUrl,
            'resourceDesc': item.resourceDesc,
            'resourceClass': item.resourceClass,
            'resourceMethod': item.resourceMethod,
            'resourceType': item.resourceType,
            'permissionFlag': item.permissionFlag,
            'querySql': item.querySql }
          this.paramTree = (!item.menuParam || item.menuParam.length === 0) ? [
            { checked: '1',
              children: [],
              columnId: null,
              fieldDesc: null,
              fieldId: null,
              fieldName: 'root',
              fieldType: 'java.util.Map',
              isMap: true }
          ] : item.menuParam
          this.paramTable = this.allChecked(item.tableParam) || []
          this.parameterType = item.ParamType || null
          this.returnTree = (!item.menuReturn || item.menuReturn.length === 0) ? [
            { checked: '1',
              children: [],
              columnId: null,
              fieldDesc: null,
              fieldId: null,
              fieldName: 'root',
              fieldType: 'java.util.Map',
              isMap: true }
          ] : item.menuReturn
          this.returnTable = this.allChecked(item.tableReturn) || []
          this.returnType = item.ReturnType || null
          this.resetForm(updateParam)
        })
      }
    },
    allChecked(param) {
      for (const iterator of param) {
        iterator.checked = '1'
      }
      return param
    },
    resetForm(updateParam) {
      this.$nextTick(() => {
        this.$refs.optionParamOne.clearValidate()
      })
      for (const key2 in this.optionParam) {
        this.optionParam[key2] = updateParam ? updateParam[key2] : null
      }
      for (const key2 in this.optionParam) {
        if (key2 !== 'resourceId') {
          if (this.$refs[key2]) {
            this.$refs[key2].changeToCurrentValue(updateParam ? updateParam[key2] : null)
          }
        }
      }
    },
    dialogSubmit() {
      if (this.dialogForm === 1) {
        this.$refs.optionParamOne.validate((valid) => {
          if (valid) {
            if (this.dialogStatus === 'create') {
              baseRequest('/basic/resource/getParams', this.optionParam).then(response => {
                this.getDataList(response)
                this.dialogForm = 2
              })
            } else {
              this.dialogForm = 2
              this.$nextTick(function() {
                this.$refs.treeTable.getSelect()
              })
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else if (this.dialogForm === 2) {
        const result = this.$refs.treeTable.getParamsMenu()
        this.tablesParam = result.tablesParam
        this.paramTree = result.menuTreeAll
        const param = { listTable: this.tablesParam }
        baseRequest('/basic/resource/listParams', param).then(response => {
          this.mappingTreeData = response.data.item
          this.mappingData = result.menuTreeAll
          this.dialogForm = 3
        })
      } else if (this.dialogForm === 3) {
        this.dialogForm = 4
        this.$nextTick(function() {
          this.$refs.treeTableReturn.getSelect()
        })
      } else if (this.dialogForm === 4) {
        const result = this.$refs.treeTableReturn.getParamsMenu()
        this.tablesReturn = result.tablesParam
        this.returnTree = result.menuTreeAll
        const param = { listTable: this.tablesReturn }
        baseRequest('/basic/resource/listParams', param).then(response => {
          this.mappingTreeDataReturn = response.data.item
          this.mappingDataReturn = result.menuTreeAll
          this.dialogForm = 5
        })
      } else {
        this.filterSubmit(this.mappingData)
        this.filterSubmit(this.mappingDataReturn)
        const params = {
          resourceId: this.optionParam.resourceId,
          resourceUrl: this.optionParam.resourceUrl,
          resourceDesc: this.optionParam.resourceDesc,
          resourceClass: this.optionParam.resourceClass,
          resourceMethod: this.optionParam.resourceMethod,
          resourceType: this.optionParam.resourceType,
          permissionFlag: this.optionParam.permissionFlag,
          querySql: this.optionParam.querySql,
          params: this.mappingData,
          tables: this.tablesParam,
          returns: this.mappingDataReturn,
          tablesReturn: this.tablesReturn
        }
        if (this.dialogStatus === 'create') {
          params.configMode = this.configMode
          baseRequest('/basic/resource/add', params).then(response => {
            this.$Message.success('操作成功')
            this.dialogFormVisible = false
            this.handleFilter()
          })
        } else {
          params.oldParams = this.preUpdateItem.params
          params.oldReturns = this.preUpdateItem.returns
          baseRequest('/basic/resource/update', params).then(response => {
            this.$Message.success('操作成功')
            this.dialogFormVisible = false
            this.handleFilter()
          })
        }
      }
    },
    quickComplete() {
      this.$refs.optionParamOne.validate((valid) => {
        if (valid) {
          const params = {
            configMode: '1',
            params: [],
            // checked: "0"
            // columnId: null
            // fieldDesc: null
            // fieldName: "root"
            // fieldType: "java.util.Map"
            // isMap: "true"
            permissionFlag: '0',
            querySql: null,
            resourceClass: this.optionParam.resourceClass,
            resourceDesc: this.optionParam.resourceDesc,
            resourceId: null,
            resourceUrl: this.optionParam.resourceUrl,
            resourceMethod: this.optionParam.resourceMethod,
            resourceType: this.optionParam.resourceType,
            returns: [],
            // checked: "0"
            // columnId: null
            // fieldDesc: null
            // fieldName: "root"
            // fieldType: "java.util.Map"
            // isMap: "false"
            tables: [],
            tablesReturn: []
          }
          baseRequest('/basic/resource/add', params).then(response => {
            this.$Message.success('操作成功')
            this.dialogFormVisible = false
            this.handleFilter()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    singleTbClick() {
      this.$refs.singeTable.formSubmit()
    },
    sqlTbClick() {
      this.$refs.sqlTable.formSubmit()
    },
    changeDialogForm(dialogForm) {
      this.dialogForm = dialogForm
    },
    getDataList(response) {
      const item = response.data.item
      this.paramTree = item.menuParam
      this.paramTable = item.tableParam
      this.returnTree = item.menuReturn
      this.returnTable = item.tableReturn
      this.parameterType = item.parameterType
      this.returnType = item.returnType
    },
    dialogBefore() {
      if (this.dialogForm === 2 && this.dialogStatus === 'update') {
        const result = this.$refs.treeTable.getParamsMenu()
        this.paramTree = result.menuTreeAll
      } else if (this.dialogForm === 4) {
        const result = this.$refs.treeTableReturn.getParamsMenu()
        this.returnTree = result.menuTreeAll
      }
      this.dialogForm = this.dialogForm - 1
      if (this.dialogForm === 2) {
        this.$nextTick(function() {
          this.$refs.treeTable.getSelect()
        })
      } else if (this.dialogForm === 4) {
        this.$nextTick(function() {
          this.$refs.treeTableReturn.getSelect()
        })
      }
    },
    filterSubmit(data) {
      for (const iterator of data) {
        delete iterator.parent
        delete iterator._expanded
        delete iterator._level
        delete iterator._show
        if (iterator.children) {
          this.filterSubmit(iterator.children)
        }
      }
    },
    closeMask() {
      this.dialogFormSinge = false
      this.dialogFormSql = false
    },
    singleBefore() {
      if (this.dialogForm === 4) {
        this.dialogForm = 2
      } else {
        this.dialogForm = 1
      }
      this.$refs.singeTable.preChecked(1)
    },
    changeSqlTitle(text) {
      this.sqlTitle = text
    },
    handleDeploy(resourceId) {
      this.$refs.deploy.openDialog(resourceId)
    },
    handlePreview(row) {
      const param = { resourceId: row.resourceId }
      baseRequest('/basic/test/getList', param).then(response => {
        this.previewData = JSON.stringify(response.data)
        this.previewData = JSON.parse(this.previewData)
        this.dialogPreviewSwitch = true
      })
    },
    // 新增资源按钮 临时存在
    handleAddResource() {
      for (const key in this.newResource) {
        this.newResource[key] = null
      }
      this.dialogFormNewResource = true
      this.$nextTick(() => {
        this.$refs.newResource.clearValidate()
      })
    },
    // 新增资源的保存
    saveAddResource() {
      baseRequest('/basic/test/add', this.newResource).then(response => {
        this.$Message.success('操作成功')
        this.dialogFormNewResource = false
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.resource-option {
  padding-top: 15px;
}
.el-autocomplete-suggestion {
  li {
    line-height: 18px;
    padding: 7px;
    .name {
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .desc {
      font-size: 12px;
      color: #b4b4b4;
    }
  }
}
.resource-option {
  .dialog-scoll {
    height: 370px;
    overflow: overlay;
  }
}
.dialog-default2 .dialog-contant-default2 {
  height: 550px;
  overflow: auto;
}
</style>