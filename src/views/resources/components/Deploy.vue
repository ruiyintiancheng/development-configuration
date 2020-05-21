<template>
  <div class="deploy">
    <!-- 配置弹框 -->
    <el-dialog :title="dialogStatus !== '6'?dialogType[dialogStatus]:'列表属性配置'"
               :visible.sync="dialogSwitch"
               v-el-drag-dialog
               :close-on-click-modal="false"
               width="60%"
               custom-class="dialog-default">
      <div class="dialog-contant-default resource-option-dialog">
        <!-- 选择类型 -->
        <div v-if="dialogStatus === '1'"
             style='width:320px;margin:100px auto;'>
          选择类型: <el-select v-model="typeSelect">
            <template v-for="(value,index) in dialogType">
              <el-option v-if="index !== '1'"
                         :key="index"
                         :label="value"
                         :value="index">
              </el-option>
            </template>
          </el-select>
        </div>
        <!-- 参数校验 -->
        <el-table v-if="dialogStatus === '2'"
                  stripe
                  :data="paramValidateData"
                  :height="formDialogVueListHeight">
          <el-table-column label="属性名称"
                           align="center">
            <template slot-scope="scope">
              {{ scope.row.fieldName }}
            </template>
          </el-table-column>
          <el-table-column label="属性描述"
                           align="center">
            <template slot-scope="scope">
              {{ scope.row.fieldDesc }}
            </template>
          </el-table-column>
          <el-table-column label="操作"
                           align="center">
            <template slot-scope="scope">
              <el-button type="primary"
                         size="mini"
                         @click="getValidateParam(scope.row)">配置</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 返回校验规则 -->
        <div v-if="dialogStatus === '3'">
          <el-form :model="resourceParams"
                   :inline="true">
            <el-form-item label="url"
                          :prop="resourceParams.resourceUrl">
              <el-input style="width:155px;"
                        v-model="resourceParams.resourceUrl"
                        clearable=""></el-input>
            </el-form-item>
            <el-form-item label="资源描述"
                          :prop="resourceParams.resourceDesc">
              <el-input style="width:155px;"
                        v-model="resourceParams.resourceDesc"
                        clearable=""></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary"
                         @click="searchResourceData()">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="resourceData"
                    border
                    fit
                    highlight-current-row
                    stripe
                    style="width: 100%;margin-top:5px;"
                    :height="formDialogVueListHeight -120">
            <el-table-column width="55"
                             label="单选"
                             align="center">
              <template slot-scope="scope">
                <el-radio v-model="formResourceRadio"
                          :label="scope.row.resourceId">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="URL"
                             align="center">
              <template slot-scope="scope">
                <span>{{scope.row.resourceUrl}}</span>
              </template>
            </el-table-column>
            <el-table-column label="资源类型"
                             align="center">
              <template slot-scope="scope">
                <span>{{scope.row.field_convert_map.resourceType}}</span>
              </template>
            </el-table-column>
            <el-table-column label="资源描述"
                             align="center">
              <template slot-scope="scope">
                <span>{{scope.row.resourceDesc}}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination background
                           @size-change="handleSizeChange"
                           @current-change="handleCurrentChange"
                           :current-page="resourceParams.pageNo"
                           :page-sizes="[10,20,30, 50]"
                           :page-size="resourceParams.pageSize"
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="total">
            </el-pagination>
          </div>
        </div>
        <!-- 返回表单配置 -->
        <el-table v-if="dialogStatus === '4'"
                  stripe
                  :data="returnFormData"
                  :height="formDialogVueListHeight">
          <el-table-column label="表单顺序"
                           align="center">
            <template slot-scope="scope">
              {{ scope.row.dispOrder }}
            </template>
          </el-table-column>
          <el-table-column label="表单名称"
                           align="center">
            <template slot-scope="scope">
              {{ scope.row.formName }}
            </template>
          </el-table-column>
          <el-table-column label="表单类型"
                           align="center">
            <template slot-scope="scope">
              {{ scope.row.formType }}
            </template>
          </el-table-column>
          <el-table-column :render-header="renderHeader"
                           align="center">
            <template slot-scope="scope">
              <el-button type="primary"
                         @click="updateFormItem(scope.row)"
                         plain
                         size="mini">修改</el-button>
              <el-button type="danger"
                         @click="deleteFormItem(scope.row)"
                         plain
                         size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 返回列表配置 -->
        <el-row v-if="dialogStatus === '5'"
                v-loading="dialogLoading"
                element-loading-text="给我一点时间">
          <el-col :span="12">
            <el-table :data="tableListData"
                      stripe
                      :height="formDialogVueListHeight">
              <el-table-column label="属性名称"
                               align="center">
                <template slot-scope="scope">
                  {{ scope.row.fieldName }}
                </template>
              </el-table-column>
              <el-table-column label="属性描述"
                               align="center">
                <template slot-scope="scope">
                  {{ scope.row.fieldDesc }}
                </template>
              </el-table-column>
              <el-table-column label="操作"
                               align="center">
                <template slot-scope="scope">
                  <el-button type="primary"
                             plain
                             size="mini"
                             @click="append(scope.row)"
                             icon="el-icon-d-arrow-right"></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12"
                  class="table-head"
                  :style="{height:formDialogVueListHeight+'px'}">
            <h3 style="margin-top: 0;">列表表头</h3>
            <el-tree ref='tableTree'
                     :data="tableTreeData"
                     highlight-current
                     @node-click="treeClick"
                     :props="defaultProps"
                     :expand-on-click-node="false"
                     default-expand-all
                     draggable
                     :allow-drop="allowDrop"
                     :allow-drag="allowDrag">
              <span class="custom-tree-node"
                    slot-scope="{ node, data }">
                <span>{{ node.label }}<span v-if="node.label">&nbsp;</span><b>{{ data.fieldLabel }}</b></span>
                <span>
                  <el-button type="text"
                             size="mini"
                             @click="() => append()">添加</el-button>
                  <el-button v-if="data.fieldId !==0"
                             type="text"
                             size="mini"
                             @click="() => remove(node, data)">删除</el-button>
                </span>
              </span>
            </el-tree>
          </el-col>
        </el-row>
        <!-- 返回列表属性 -->
        <el-row v-if="dialogStatus === '6'"
                v-loading="dialogLoading"
                element-loading-text="给我一点时间">
          <el-col :span="7"
                  :style="{height:formDialogVueListHeight+'px'}">
            <h3 style="margin-top: 0;">列表表头</h3>
            <el-tree ref='tableTree'
                     :data="tableTreeAllData"
                     :props="defaultProps"
                     :expand-on-click-node="false"
                     @node-click="elementNodeClick"
                     default-expand-all>
              <span class="custom-tree-node"
                    slot-scope="{ node, data }">
                <span>{{ node.label }}<span v-if="node.label">&nbsp;</span><b>{{ data.fieldLabel }}</b></span>
              </span>
            </el-tree>
          </el-col>
          <el-col :span="17">
            <el-table :data="tableAttributesData"
                      stripe
                      :height="formDialogVueListHeight">
              <el-table-column label="参数"
                               prop="paramName"
                               align="center"></el-table-column>
              <el-table-column label="说明"
                               prop="paramDesc"
                               align="center"></el-table-column>
              <el-table-column label="类型"
                               prop="dataType"
                               align="center"></el-table-column>
              <el-table-column label="可选值"
                               prop="optionalValue"
                               align="center"></el-table-column>
              <el-table-column label="默认值"
                               prop="defaultValue"
                               align="center"></el-table-column>
              <el-table-column label="输入值"
                               align="center">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.paramValue"></el-input>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <!-- 资源参数 -->
        <el-table v-if="dialogStatus === '7' "
                  :data="resourceParamData"
                  border
                  fit
                  highlight-current-row
                  stripe
                  style="width: 100%;"
                  :height="formDialogVueListHeight">
          <el-table-column label="参数key"
                           prop="paramKey"
                           align="center"></el-table-column>
          <el-table-column label="参数名称"
                           prop="paramLabel"
                           align="center"></el-table-column>
          <el-table-column label="参数范围"
                           prop="field_convert_map.paramScope"
                           align="center"></el-table-column>
          <el-table-column label="参数描述"
                           prop="paramDesc"
                           align="center"></el-table-column>
          <el-table-column label="参数值"
                           align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.paramValue"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer">
        <el-button @click="dialogSwitch = false">取消</el-button>
        <el-button v-if="dialogStatus !== '6' && dialogStatus !== '1'"
                   @click="dialogStatus = '1'">上一步</el-button>
        <el-button v-if="dialogStatus === '6'"
                   @click="dialogStatus = '5'">上一步</el-button>
        <el-button v-if="dialogStatus === '1'"
                   type="primary"
                   @click="nextSubmit()">下一步</el-button>
        <el-button v-else-if="dialogStatus === '3'"
                   type="primary"
                   @click="saveSelectResource()">保存</el-button>
        <el-button v-else-if="dialogStatus === '7'"
                   type="primary"
                   @click="saveResourceParam()">保存</el-button>
        <el-button v-else-if="dialogStatus === '5'"
                   type="primary"
                   @click="saveTableTreeData()">保存并下一步</el-button>
        <el-button v-else-if="dialogStatus === '6'"
                   type="primary"
                   @click="saveTableAttr()">保存当前配置</el-button>
        <el-button v-else
                   type="primary"
                   @click="dialogSwitch = false">完成</el-button>
      </div>
      <!-- 参数校验配置弹框 -->
      <el-dialog title="验证设置"
                 :visible.sync="dialogValidateSwitch"
                 v-el-drag-dialog
                 :close-on-click-modal="false"
                 width="60%"
                 append-to-body
                 custom-class="dialog-default">
        <div class="dialog-contant-default">
          <el-table style="margin:auto;"
                    :data="parmValidateFit"
                    stripe
                    fit
                    ref="parmValidateTable"
                    @selection-change="selectChange1"
                    :height="formDialogVueListHeight">
            <el-table-column type="selection">
            </el-table-column>
            <el-table-column label="验证名称"
                             align="center">
              <template slot-scope="scope">
                {{ scope.row.defDesc }}
              </template>
            </el-table-column>
            <el-table-column label="错误提示"
                             min-width="130"
                             align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.field_convert_map.validateMsg"
                          style="width: 100px;"
                          class="validateParam-input"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="验证类型"
                             min-width="130"
                             align="center">
              <template slot-scope="scope">
                <span class='red-star'>*</span>
                <el-select v-model="scope.row.validateType"
                           @change="changeValidateInput(scope.row)"
                           style="width: 100px;"
                           class="validateParam-input">
                  <el-option v-for="(text,value) in validateType"
                             :key="value"
                             :value="value"
                             :label="text"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="验证顺序"
                             min-width="130"
                             align="center">
              <template slot-scope="scope">
                <span class='red-star'>*</span>
                <el-input v-model="scope.row.validateOrder"
                          style="width: 100px;"
                          class="validateParam-input"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="验证参数"
                             min-width="130"
                             align="left">
              <template slot-scope="scope"
                        v-if="scope.row.paramNum">
                <span v-for="(item,index) in scope.row.paramNum"
                      :key="index">
                  <span v-if="index !== 0"> -</span>
                  <el-tooltip :content="scope.row.paramDesc"
                              placement="top">
                    <el-input v-model="scope.row.defValue[index]"
                              style="width: 100px;"
                              class="validateParam-input"></el-input>
                  </el-tooltip>
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer">
          <el-button @click="dialogValidateSwitch = false">取消</el-button>
          <el-button type="primary"
                     @click="saveParamValidate()">完成</el-button>
        </div>
      </el-dialog>
      <!-- 表单配置弹框 -->
      <el-dialog :title="formOperateTitle[formOperate]+'-表单配置-'+formTitle[formStatus]"
                 v-el-drag-dialog
                 :close-on-click-modal="false"
                 :visible.sync="dialogFormSwitch"
                 width="50%"
                 append-to-body
                 custom-class="dialog-default">
        <div class="dialog-contant-default form-option-dialog">
          <el-form v-if="formStatus === '1'"
                   ref="formOperate"
                   :rules='rules'
                   :model="formInputModel"
                   label-position="left"
                   label-width="120px"
                   style='width: 300px; margin:auto;'>
            <el-form-item label="表单名称"
                          prop="formName">
              <el-select style="width: 155px;"
                         clear
                         class="filter-item"
                         v-model="formInputModel.formName"
                         filterable
                         allow-create
                         clearable
                         default-first-option>
                <el-option v-for="(text,value,index) in formOperateNameSelect"
                           :key="index"
                           :label="text"
                           :value="value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="表单顺序"
                          prop="dispOrder">
              <el-input style="width: 155px;"
                        class="filter-item"
                        v-model="formInputModel.dispOrder"></el-input>
            </el-form-item>
            <el-form-item label="表单类型"
                          prop="formType">
              <el-select style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.formType"
                         @change="changeFormType">
                <el-option v-for="(value,key) in formTypeSelects"
                           :key='key'
                           :label='value'
                           :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="formInputModel.formType === 'select' || formInputModel.formType === 'asynSelect'"
                          label="表单下拉选项"
                          prop="formSelects">
              <el-select style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.formSelects"
                         @change="getFormSelectDefaultSelect">
                <el-option v-for="(value,key) in formSelectSelects"
                           :key='key'
                           :label='value'
                           :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="formInputModel.formType === 'cascader'"
                          label="表单下拉选项"
                          prop="formSelects">
              <el-select style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.formSelects">
                <el-option v-for="(value,key) in formSelectCascader"
                           :key='value'
                           :label='key'
                           :value="value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="formInputModel.formType === 'remoteSelect'"
                          label="表单下拉请求"
                          prop="formSelects">
              <el-select style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.formSelects"
                         filterable>
                <el-option v-for="(value,key) in formSelectResources"
                           :key='key'
                           :label='value'
                           :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="formInputModel.formType !== 'remoteSelect'"
                          label="表单默认值"
                          prop="defaultValue">
              <el-select v-if="formInputModel.formType === 'select' || formInputModel.formType === 'asynSelect'"
                         style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.defaultValue"
                         clearable>
                <el-option v-for="(value,key) in formSelectDefaultSelect"
                           :key='key'
                           :label='value'
                           :value="key"></el-option>
              </el-select>
              <el-input v-else
                        style="width: 155px;"
                        class="filter-item"
                        v-model="formInputModel.defaultValue"></el-input>
            </el-form-item>
            <el-form-item v-if="formInputModel.formType === 'textRange' || formInputModel.formType === 'dateRange'"
                          label="结束默认值"
                          prop="defaultRangeValue">
              <el-input style="width: 155px;"
                        class="filter-item"
                        v-model="formInputModel.defaultRangeValue"></el-input>
            </el-form-item>
            <el-form-item label="表单Label"
                          prop="formLabel">
              <el-select @change="labelSelectEvent"
                         style="width: 155px;"
                         class="filter-item"
                         v-model="formInputModel.formLabel"
                         filterable
                         allow-create
                         clearable
                         default-first-option>
                <el-option v-for="(text,key) in formLabelSelects"
                           :key="key"
                           :label="text"
                           :value="key"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <el-table v-else-if="formStatus === '2'"
                    :data="formAttributesData"
                    :height="formDialogVueListHeight">
            <el-table-column label="参数"
                             prop="paramName"
                             align="center"></el-table-column>
            <el-table-column label="说明"
                             prop="paramDesc"
                             align="center"></el-table-column>
            <el-table-column label="类型"
                             prop="dataType"
                             align="center"></el-table-column>
            <el-table-column label="可选值"
                             prop="optionalValue"
                             align="center"></el-table-column>
            <el-table-column label="默认值"
                             prop="defaultValue"
                             align="center"></el-table-column>
            <el-table-column label="输入值"
                             align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.paramValue"></el-input>
              </template>
            </el-table-column>
          </el-table>
          <el-table v-else-if="formStatus === '3'"
                    ref="formComponentTable"
                    :data="formComponentsData">
            <el-table-column width="55"
                             label="单选"
                             align="center">
              <template slot-scope="scope">
                <el-radio v-model="formComponentRadio"
                          :label="scope.row.componentId">&nbsp;</el-radio>
              </template>
            </el-table-column>
            <el-table-column label="组件id"
                             width="100"
                             prop="componentId"
                             align="center"></el-table-column>
            <el-table-column label="组件描述"
                             prop="componentDesc"
                             align="center"></el-table-column>
          </el-table>
        </div>
        <div slot="footer">
          <el-button @click="dialogFormSwitch = false">取消</el-button>
          <el-button type="primary"
                     v-if="formStatus === '1'"
                     @click="formNext()">下一步</el-button>
          <el-button type="primary"
                     v-else
                     @click="saveFormOperate()">完成</el-button>
        </div>
      </el-dialog>
      <el-dialog title="添加表头"
                 :visible.sync="dialogTableHead"
                 v-el-drag-dialog
                 :close-on-click-modal="false"
                 width="50%"
                 append-to-body>
        <el-form :rules="treeHeadNameRules"
                 ref="treeTableHead"
                 :model="treeHeadName"
                 style='width: 300px; margin:auto;'>
          <el-form-item label="表头名称"
                        prop="value">
            <el-input style="width: 155px;"
                      class="filter-item"
                      v-model="treeHeadName.value"
                      clearable></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="dialogTableHead = false">取消</el-button>
          <el-button type="primary"
                     @click="saveTableHead()">完成</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { baseRequest, baseSearch } from '@/api/base'
import { deepClone } from '@/utils/index'
var checkFormOrder = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('请输入排序'))
  } else {
    const arrStr = (value + '').split('')
    let isNum = true
    for (const iterator of arrStr) {
      if (!Number.isInteger(parseInt(iterator))) {
        isNum = false
        break
      }
    }
    if (!isNum) {
      callback(new Error('请输入整数型'))
    } else {
      callback()
    }
  }
}
export default {
  data() {
    return {
      dialogLoading: false,
      resourceId: null, // 资源id
      dialogStatus: '1', // 对话框类型
      dialogType: { // 对话框选项
        '1': '选择类型',
        '7': '资源参数',
        '2': '参数校验',
        '3': '返回规则校验',
        '4': '返回表单配置',
        '5': '返回列表配置'
      },
      dialogSwitch: false, // 对话框开关
      dialogValidateSwitch: false, // 参数校验开关
      typeSelect: null, // 选择类型值
      paramValidateData: [], // 参数校验列表
      parmValidateFit: [], // 参数校验选项类表
      paramValidateInput: {}, // 参数校验所有输入框的值对象
      validateType: {// 验证类型
        '0': '公共',
        '1': '前端',
        '2': '后端'
      },
      selectChangePv: [], // 参数校验选中项
      paramValidateKey: null, // 参数校验参数id
      returnFormData: [], // 返回表单列表,
      dialogFormSwitch: false, // 表单配置弹框开关
      formOperateNameSelect: {}, // 下拉表单名称选项
      formLabelSelects: {}, // 下拉label选项
      hasKey: false,
      formSelectSelects: {}, // 下拉select选项
      formSelectCascader: [], // 下拉select选项
      formSelectResources: {}, // 下拉select请求
      formSelectDefaultSelect: {}, // 表单下拉select默认值下拉
      formInputModel: { // form表单modal数据
        formId: '',
        formName: '',
        formType: '',
        formSelects: '',
        formLabel: '',
        defaultValue: '',
        defaultRangeValue: '',
        dispOrder: '',
        resourceUrl: '',
        field_convert_map: {
          formLabel: ''
        }
      },
      formTypeSelects: {// form表单类型下拉
        // text: 'text',
        // textRange: 'textRange',
        // select: 'select',
        // asynSelect: 'asynSelect',
        // remoteSelect: 'remoteSelect',
        // textarea: 'textarea',
        // date: 'date',
        // dataRange: 'dateRange',
        // selectComponent: 'selectComponent'
      },
      formTitle: { // 表单配置标题
        '1': '基本设置',
        '2': '属性配置',
        '3': '组件选择'
      },
      formStatus: '1', // 表单进度状态
      formOperate: 'create', // 表单操作状态
      formOperateTitle: {
        'create': '添加',
        'update': '修改'
      },
      rules: { // 表单基本属性验证规则
        formName: [
          { required: true, message: '请输入表单名称', trigger: 'change' }
        ],
        dispOrder: [
          { required: true, message: '请输入表单顺序', trigger: 'change' },
          { validator: checkFormOrder, trigger: 'change' }
        ],
        formType: [
          { required: true, message: '请输入表单类型', trigger: 'change' }
        ],
        formSelects: [
          { required: true, message: '请输入表单下拉选项', trigger: 'change' }
        ]
      },
      formAttributesData: [], // 表单element属性列表
      formComponentsData: [], // 表单组件列表
      formComponentRadio: null, // 单选选中值
      formResourceRadio: null, // 单选选中值
      formDialogVueListHeight: 0, // form选择vue属性列表高度
      tableListData: [], // 列表数据
      tableTreeData: [{ // 列表树数据
        fieldId: 0,
        fieldName: 'table',
        fieldLabel: '表格',
        children: []
      }
      ],
      tableTreeAllData: [], // 列表树数据(带表头)
      defaultProps: { // 列表属性
        children: 'children',
        label: 'fieldName'
      },
      treeNode: null, // 列表选中树节点
      dialogTableHead: false, // 列表输入表头开关
      treeHeadName: { // 列表添加表头值
        value: null
      },
      treeHeadNameRules: { // 验证
        value: [
          { required: true, message: '请输入表头名称', trigger: 'blur' }
        ]
      },
      selectDataNode: null, // 添加选中节点
      tableAttributesData: [], // table element 属性
      elementNode: { // 配置选中节点
        fieldId: 0,
        fieldName: 'table',
        fieldLabel: '表格'
      },
      resourceParams: { // 返回校验规则选择资源查询框
        pageNo: 1,
        resourceUrl: null,
        resourceDesc: null
      },
      total: null, // 返回总数
      resourceData: [], // 返回校验规则选择资源
      resourceSelection: [], // 返回选中资源
      resourceParamData: [] // 资源参数列表
    }
  },
  methods: {
    // 打开当前页对话框
    openDialog(resourceId) {
      this.resourceId = resourceId
      this.dialogStatus = '1'
      this.typeSelect = null
      this.dialogSwitch = true
      this.getFormDialogHeight()
    },
    // 外层下一步
    nextSubmit() {
      if (this.typeSelect === '2') {
        this.getResourceList()
        // baseRequest('/validates/getValidateList').then(response => {
        //   this.parmValidateFit = response.data.item
        //   this.getParamValidateInput()
        // })
      } else if (this.typeSelect === '3') {
        this.getResourceSelect()
        this.resourceParams = { // 返回校验规则选择资源查询框
          pageNo: 1,
          resourceUrl: null,
          resourceDesc: null
        }
        this.getResourceData()
      } else if (this.typeSelect === '4') {
        this.handleReturnData()
      } else if (this.typeSelect === '5') {
        this.dialogLoading = true
        this.getTableList()
      } else if (this.typeSelect === '7') {
        this.getResourceParamList()
      }
      this.dialogStatus = this.typeSelect
    },
    // 获取参数校验列表
    getResourceList() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getResourceList', param).then(response => {
        this.paramValidateData = response.data.item
      })
    },
    // 获取table列表
    getTableList() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getTableListData', param).then(response => {
        this.tableListData = response.data.item
        this.getTableTreeList()
      })
    },
    // 获取table树列表
    getTableTreeList() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getTableTreeData', param).then(response => {
        if (response.data.item) {
          this.tableTreeData[0].children = response.data.item
        }
        this.dialogLoading = false
      })
    },
    // 获取table树列表(包含表头)
    getTableTreeAllList() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getTableTreeAllData', param).then(response => {
        if (response.data.item && response.data.item.length !== 0) {
          this.tableTreeAllData = response.data.item
          this.elementNode = this.tableTreeAllData[0]
          this.getTableAttribute()
        }
      })
    },
    // 参数校验选中验证并赋值
    getValidateParam(row) {
      const param = { fieldId: row.fieldId }
      // this.parmValidateFit = []
      baseRequest('/basic/validates/getValidateList', param).then(response => {
        this.parmValidateFit = response.data.item
        this.paramValidateKey = row.fieldId
        // this.getParamValidateInput()
        this.dialogValidateSwitch = true
        this.$nextTick(function() {
          this.getSelect()
        })
      })
    },
    // 为选择验证赋null值
    getParamValidateInput() {
      this.paramValidateInput = {}
      for (const iterator of this.parmValidateFit) {
        const temp = []
        if (!iterator.paramNum) {
          // temp['0'] = null
        } else {
          for (let x = 0; x < iterator.paramNum; x++) {
            temp[x] = null
          }
        }
        this.$set(iterator, 'defValue', temp)
        this.$set(iterator, 'validateOrder', null)
        this.$set(iterator, 'validateType', null)
        this.$set(iterator, 'validateOrder', null)
        this.$set(iterator, 'validateMsg', null)
        this.$set(iterator, 'field_convert_map', {
          validateMsg: null
        })
      }
    },
    // 保存验证修改选中
    saveParamValidate() {
      for (const iterator of this.selectChangePv) {
        if (iterator.validateType === null || !iterator.validateType) {
          this.$Message.error('请对选中条目输入类型')
          return
        }
        if (iterator.validateOrder === null || !iterator.validateOrder) {
          this.$Message.error('请对选中条目输入排序')
          return
        }
      }
      this.fitToChecked()
      const param = { items: this.parmValidateFit, fieldId: this.paramValidateKey }
      baseRequest('/basic/resource/saveValidate', param).then(response => {
        this.$Message.success('操作成功')
        this.dialogValidateSwitch = false
      })
    },
    // 参数验证选中checked更改
    fitToChecked() {
      for (const it of this.parmValidateFit) {
        let boo = false
        for (const it2 of this.selectChangePv) {
          if (it.defId === it2.defId) {
            boo = true
          }
        }
        if (boo) {
          it.checked = '1'
        } else {
          it.checked = '0'
        }
      }
    },
    // 参数校验 初始化选中
    getSelect() {
      for (const iterator of this.parmValidateFit) {
        if (iterator.checked === '1') {
          this.$refs.parmValidateTable.toggleRowSelection(iterator, true)
        }
      }
    },
    // 获取参数验证选中数据
    selectChange1(val) {
      this.selectChangePv = val
    },
    // 获取返回表单配置列表
    handleReturnData() {
      const param = { resourceId: this.resourceId }
      param.orderBySection = 'disp_Order'
      baseRequest('/basic/resource/getFormList', param).then(response => {
        this.returnFormData = response.data.item
      })
    },
    // 表头添加图标
    renderHeader(h) {
      return (
        <div>
          <span>操作 </span>
          <el-button onClick={this.addFormItem} type='warning' icon='el-icon-plus' size='mini'></el-button>
        </div>
      )
    },
    // 添加返回值表单
    addFormItem() {
      this.resetFormInputs()
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getFormSelectFormName', param).then(response => {
        const data = response.data.item
        const obj = {}
        for (const iterator of data) {
          obj[iterator] = iterator
        }
        this.formOperateNameSelect = obj
      })
      baseRequest('/basic/resource/getFormLabelSelect').then(response => {
        this.formLabelSelects = response.data.item
      })
      const param1 = { dictType: 'basicDictType' }
      baseRequest('/basic/common/getSelectOptions', param1).then(response => {
        this.formSelectSelects = response.data.item
      })
      baseRequest('/basic/resource/getFormSelectResources').then(response => {
        this.formSelectResources = response.data.item
      })
      const param2 = { dictType: 'vueComponents' }
      baseRequest('/basic/common/getSelectOptions', param2).then(response => {
        const temp = response.data.item
        delete temp.table
        delete temp.column
        this.formTypeSelects = temp
        // this.formTypeSelects = { 'text': 'text',
        //   'select': 'select',
        //   'date': 'date',
        //   'selectComponent': 'selectComponent',
        //   'time': 'time',
        //   'radioButton': 'radioButton',
        //   'remoteSelect': 'remoteSelect',
        //   'checkbox': 'checkbox',
        //   'checkboxButton': 'checkboxButton',
        //   'textarea': 'textarea',
        //   'dateTime': 'dateTime',
        //   'upload': 'upload',
        //   'cascader': 'cascader',
        //   'textRange': 'textRange',
        //   'asynSelect': 'asynSelect',
        //   'switch': 'switch',
        //   'dateRange': 'dateRange',
        //   'autotext': 'autotext',
        //   'radio': 'radio' }
      })
      baseRequest('/basic/resourceParams/getCascaderOptions').then(response => {
        this.formSelectCascader = response.data.item
      })
      this.formStatus = '1'
      this.formOperate = 'create'
      this.dialogFormSwitch = true
    },
    // 删除返回值表单
    deleteFormItem(row) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = { formId: row.formId }
        baseRequest('/basic/resource/deleteFormItem', param).then(request => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.handleReturnData()
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // })
      })
    },
    // 修改返回值表单
    updateFormItem(row) {
      this.resetFormInputs()
      const param = { formId: row.formId }
      baseRequest('/basic/resource/getFormSelectFormName', { resourceId: this.resourceId }).then(response => {
        const data = response.data.item
        const obj = {}
        for (const iterator of data) {
          obj[iterator] = iterator
        }
        this.formOperateNameSelect = obj
      })
      baseRequest('/basic/resource/getFormLabelSelect').then(response => {
        this.formLabelSelects = response.data.item
      })
      const param1 = { dictType: 'basicDictType' }
      baseRequest('/basic/common/getSelectOptions', param1).then(response => {
        this.formSelectSelects = response.data.item
      })
      baseRequest('/basic/resource/getFormSelectResources').then(response => {
        this.formSelectResources = response.data.item
      })
      const param2 = { dictType: 'vueComponents' }
      baseRequest('/basic/common/getSelectOptions', param2).then(response => {
        this.formTypeSelects = response.data.item
      })

      baseRequest('/basic/resource/getFormBaseData', param).then(response => {
        if (response.data.item.formLabel) {
          response.data.item.formLabel = response.data.item.formLabel + ''
          this.hasKey = true
        }
        const temp = response.data.item
        if (temp.formSelects) {
          this.getFormSelectDefaultSelect(temp.formSelects, 1)
        }
        if (!this.formLabelSelects[temp.formLabel]) {
          this.formLabelSelects[temp.formLabel] = temp.field_convert_map.formLabel
        }
        this.formInputModel = temp
        this.formStatus = '1'
        this.formOperate = 'update'
        this.dialogFormSwitch = true
      })
      baseRequest('/basic/resourceParams/getCascaderOptions').then(response => {
        this.formSelectCascader = response.data.item
      })
    },
    // 获取form弹框高度
    getFormDialogHeight() {
      this.$nextTick(function() {
        this.formDialogVueListHeight = document.querySelector('.dialog-contant-default.resource-option-dialog').offsetHeight - 20
      })
    },
    // 下拉label选中事件
    labelSelectEvent(val) {
      if (!val) return
      this.hasKey = false
      for (const key in this.formLabelSelects) {
        if (key === val) {
          this.hasKey = true
          break
        }
      }
      if (!this.hasKey) {
        this.formLabelSelects.newObj = val
        // this.formInputModel.formLabel = 'newObj'
      }
      for (const key in this.formLabelSelects) {
        if (key === this.formInputModel.formLabel) {
          this.formInputModel.field_convert_map.formLabel = this.formLabelSelects[key]
        }
      }
    },
    // 表单配置下一步
    formNext() {
      this.$refs.formOperate.validate((valid) => {
        if (valid) {
          if (!this.hasKey) {
            this.formInputModel.formLabel = 'newObj'
          }
          for (const key in this.formLabelSelects) {
            if (key === this.formInputModel.formLabel) {
              this.formInputModel.field_convert_map.formLabel = this.formLabelSelects[key]
            }
          }
          if (this.formInputModel.formType !== 'selectComponent') {
            if (this.formOperate === 'create') {
              const param = { formType: this.formInputModel.formType }
              baseRequest('/basic/resource/getAttributesList', param).then(response => {
                this.formAttributesData = response.data.item
              })
            } else {
              const param = { formType: this.formInputModel.formType, formId: this.formInputModel.formId }
              baseRequest('/basic/resource/getAttributesListUpdate', param).then(response => {
                this.formAttributesData = response.data.item
              })
            }
            this.formStatus = '2'
          } else {
            this.getFormComponentsData()
            if (this.formOperate === 'create') {
              this.formComponentRadio = null
              this.formStatus = '3'
            } else {
              const param = { formId: this.formInputModel.formId }
              baseRequest('/basic/resource/getFormComponentChecked', param).then(response => {
                this.formComponentRadio = response.data.item.componentId
                this.formStatus = '3'
              })
            }
          }
        }
      })
    },
    // 清空表单配置输入框
    resetFormInputs() {
      for (const key in this.formInputModel) {
        if (key === 'field_convert_map') {
          for (const key2 in this.formInputModel[key]) {
            this.formInputModel[key][key2] = ''
          }
        } else {
          this.formInputModel[key] = ''
        }
      }
      this.formSelectDefaultSelect = {}
      this.$nextTick(function() {
        this.$refs.formOperate.clearValidate()
      })
    },
    // 表单配置保存
    saveFormOperate() {
      const formParams = deepClone(this.formInputModel)
      if (formParams.formType !== 'selectComponent') {
        formParams.items = this.formAttributesData
        formParams.componentId = null
      } else {
        if (!this.formComponentRadio) {
          this.$Message.error('请选择组件')
          return
        }
        formParams.items = []
        formParams.componentId = this.formComponentRadio
      }
      formParams.items = this.formAttributesData
      formParams.resourceId = this.resourceId
      if (this.formOperate === 'create') {
        baseRequest('/basic/resource/addForm', formParams).then(response => {
          this.$Message.success('操作成功')
          this.handleReturnData()
          this.dialogFormSwitch = false
        })
      } else {
        baseRequest('/basic/resource/updateForm', formParams).then(response => {
          this.$Message.success('操作成功')
          this.handleReturnData()
          this.dialogFormSwitch = false
        })
      }
    },
    // 控制回显
    changeValidateInput(row) {
      this.$refs.parmValidateTable.toggleRowSelection(row)
      this.$refs.parmValidateTable.toggleRowSelection(row)
    },
    // 获取表单下拉默认值下拉
    getFormSelectDefaultSelect(val, temp) {
      const param = { dictType: val }
      baseRequest('/basic/common/getSelectOptions', param).then(response => {
        this.formSelectDefaultSelect = response.data.item
        if (temp !== 1) {
          this.formInputModel.defaultValue = ''
        }
      })
    },
    // 改变formtype事件
    changeFormType(val) {
      this.formInputModel.formSelects = ''
      this.formInputModel.defaultValue = ''
      this.formInputModel.defaultRangeValue = ''
    },
    // 获取表单组件列表
    getFormComponentsData() {
      baseRequest('/basic/resource/getFormComponentsData').then(response => {
        this.formComponentsData = response.data.item
      })
    },
    // 保存head名称
    saveTableHead() {
      this.$refs.treeTableHead.validate((valid) => {
        if (valid) {
          this.selectDataNode.fieldLabel = this.treeHeadName.value
          if (this.treeNode == null || this.treeNode.isDel) {
            this.tableTreeData[0].children.push(this.selectDataNode)
          } else {
            if (!this.treeNode.children) {
              this.$set(this.treeNode, 'children', [])
            }
            this.treeNode.children.push(this.selectDataNode)
          }
          this.dialogTableHead = false
        }
      })
    },
    // 列表配置点击添加
    append(node) {
      this.treeHeadName.value = null
      this.dialogTableHead = true
      this.$nextTick(function() {
        this.$refs.treeTableHead.clearValidate()
      })
      this.selectDataNode = {
        fieldId: null,
        fieldName: node ? node.fieldName : null,
        children: []
      }
    },
    // 列表配置点击删除
    remove(node, data) {
      data.isDel = true
      this.$refs.tableTree.remove(node)
    },
    // 选中列表配置树节点
    treeClick(data, node, com) {
      this.treeNode = data
    },
    // 允许拖入
    allowDrop(draggingNode, dropNode, type) {
      return true
    },
    // 允许拖出
    allowDrag(draggingNode) {
      return draggingNode.data.fieldId !== 0
    },
    // 保存 获取列表树 获取table属性
    saveTableTreeData() {
      const param = { resourceId: this.resourceId, items: this.tableTreeData[0].children }
      baseRequest('/basic/resource/saveTableTreeData', param).then(() => {
        this.getTableTreeAllList()
      })
    },
    // 获取属性列表
    getTableAttribute() {
      const attrParam = { resourceId: this.resourceId, fieldId: this.elementNode.fieldId, fieldType: this.elementNode.fieldId === this.tableTreeAllData[0].fieldId ? 'table' : 'column' }
      baseRequest('/basic/resource/getTableAttributes', attrParam).then((response) => {
        this.tableAttributesData = response.data.item
        this.dialogStatus = '6'
      })
    },
    // 点击树节点配置属性
    elementNodeClick(data, node, com) {
      this.elementNode = data
      this.getTableAttribute()
    },
    // 保存列表配置属性
    saveTableAttr() {
      const attrParam = { resourceId: this.resourceId, fieldId: this.elementNode.fieldId, fieldType: this.elementNode.fieldId === 0 ? 'table' : 'tableColumn', items: this.tableAttributesData }
      baseRequest('/basic/resource/saveTableAttributes', attrParam).then(() => {
        this.$Message.success('保存成功')
      })
    },
    // 获取选中资源
    getResourceSelect() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getValidateCheckedResource', param).then(response => {
        const resourceIds = response.data.item.resourceIds
        if (typeof (resourceIds) === 'object' && resourceIds.length > 0) {
          this.formResourceRadio = resourceIds[0]
        } else {
          this.formResourceRadio = null
        }
      })
    },
    // 获取资源列表
    getResourceData() {
      baseSearch('/basic/resource/getList', this.resourceParams).then(response => {
        this.resourceData = response.data.item
        this.resourceParams.pageSize = response.data.pageSize
        this.total = response.data.total
      })
    },
    // 点击查询
    searchResourceData() {
      this.resourceParams.pageNo = 1
      this.getResourceData()
    },
    // 分页
    handleSizeChange(val) {
      this.resourceParams.pageSize = val
      this.getResourceData()
    },
    handleCurrentChange(val) {
      this.resourceParams.pageNo = val
      this.getResourceData()
    },
    // 获取选中资源
    handleSelectionResource(val) {
      this.resourceSelection = val
    },
    // 保存选中
    saveSelectResource() {
      const ids = []
      if (!this.formResourceRadio) {
        this.$Message.error('请选择资源')
        return
      }
      ids.push(this.formResourceRadio)
      const param = { resourceId: this.resourceId, resourceIds: ids }
      baseRequest('/basic/resource/saveSelectResource', param).then(response => {
        this.$Message.success('操作成功')
        this.dialogSwitch = false
      })
    },
    // 获取资源参数列表
    getResourceParamList() {
      const param = { resourceId: this.resourceId }
      baseRequest('/basic/resource/getResourceParamData', param).then(response => {
        this.resourceParamData = response.data.item
      })
    },
    // 保存资源参数
    saveResourceParam() {
      const param = { resourceId: this.resourceId, items: this.resourceParamData }
      baseRequest('/basic/resource/saveResourceParam', param).then(() => {
        this.$Message.success('操作成功')
        this.dialogSwitch = false
      })
    }
  }
}
</script>

<style scoped>
.red-star {
  color: red;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.table-head {
  overflow: overlay;
}
</style>

