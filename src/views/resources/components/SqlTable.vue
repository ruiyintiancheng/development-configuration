<template>
  <div class="height-full">
    <div class="dialog-contant-default">
      <el-form v-if="dialogForm === 1"
               :rules="rules"
               ref="formOption"
               :model="optionParam"
               label-position="left"
               label-width="100px"
               style='width: 300px; margin:auto;'>
        <el-form-item label="URL"
                      prop="resourceUrl">
          <el-input type="text"
                    style="width: 155px;"
                    clearable
                    class="filter-item"
                    v-model="optionParam.resourceUrl"></el-input>
        </el-form-item>
        <el-form-item label="资源描述"
                      prop="resourceDesc">
          <el-input type="text"
                    style="width: 155px;"
                    clearable
                    class="filter-item"
                    v-model="optionParam.resourceDesc"></el-input>
        </el-form-item>
        <el-form-item label="资源类型"
                      prop="resourceType">
          <el-select style="width: 155px;"
                     class="filter-item"
                     clearable
                     v-model="optionParam.resourceType">
            <el-option v-for="(text,value) in typeOptions"
                       :key="value"
                       :label="text"
                       :value="value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限"
                      prop="permissionFlag">
          <el-select style="width: 155px;"
                     class="filter-item"
                     clearable
                     v-model="optionParam.permissionFlag">
            <el-option v-for="(text,value) in permissionFlag"
                       :key="value"
                       :label="text"
                       :value="value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源"
                      prop="databaseId">
          <el-select :disabled="dialogStatus === 'update'"
                     style="width: 155px;"
                     clearable
                     class="filter-item"
                     v-model="optionParam.databaseId">
            <el-option v-for="(text,value) in databaseSelect"
                       :key="value"
                       :label="text"
                       :value="value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="sql"
                      prop="querySql">
          <el-input :disabled="dialogStatus === 'update'"
                    type="textarea"
                    style="width: 300px;"
                    :rows="6"
                    class="filter-item"
                    v-model="optionParam.querySql">
          </el-input>
        </el-form-item>
      </el-form>
      <el-form v-else-if="dialogForm === 2"
               ref="userTables"
               label-position="left"
               label-width="200px"
               style='width: 400px; margin:auto;'>
        <el-form-item v-for="(option,index) in tables"
                      :key="index"
                      :label="option.table">
          <el-select style="width:155px;"
                     clearable
                     v-model="option.tableId">
            <el-option v-for="(text,value) in option.optionMap"
                       :key="value"
                       :label="text"
                       :value="value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <param-return ref="param"
                    v-else-if="dialogForm === 3"
                    :data="params"></param-return>
      <param-return ref="return"
                    v-else-if="dialogForm === 4"
                    :data="returns"></param-return>
      <!-- <el-row v-else>
            <el-col :span="12" style="padding:10px">
                <el-table :data="params"  fit highlight-current-row stripe height="420">
                    <el-table-column label="参数" align="center">
                        <template slot-scope="scope">
                            {{scope.row}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="12" style="padding:10px">
                <el-table :data="returns"  fit highlight-current-row stripe height="420">
                    <el-table-column label="返回值" align="center">
                        <template slot-scope="scope">
                            {{scope.row}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row> -->
    </div>
    <div slot="footer"
         class="sql-footer">
      <el-button @click="$emit('closeMask')">取消</el-button>
      <el-button v-if="dialogForm > 1"
                 @click="singleBefore()">上一步</el-button>
      <el-button v-if="dialogForm !== 4"
                 @click="formSubmit()"
                 type="primary">下一步</el-button>
      <el-button v-else
                 type="primary"
                 @click="formSubmit()">保存</el-button>
    </div>
  </div>
</template>

<script>
import { baseRequest } from '@/api/base'
import { deepClone } from '@/utils/index'
import ParamReturn from './ParamReturn'
export default {
  props: {
    dialogStatus: String
  },
  components: {
    ParamReturn
  },
  data() {
    return {
      dialogForm: 1, // 步骤
      databaseSelect: null, // 数据源下拉
      optionParam: { // 数据参数
        resourceId: null,
        resourceUrl: '',
        resourceDesc: '',
        resourceType: '',
        permissionFlag: '',
        databaseId: '',
        querySql: ''
      },
      querySql: '',
      typeOptions: {
        '0': '系统资源',
        '1': '功能资源',
        '2': '无token验证'
      },
      permissionFlag: {
        '0': '无权限',
        '1': '有权限'
      },
      dialogTitle: {
        1: '基本属性',
        2: '表选择',
        3: '参数选择',
        4: '返回值选择'
      },
      rules: {
        resourceUrl: [
          { required: true, message: '请输入URL', trigger: 'blur' }
        ],
        resourceDesc: [
          { required: true, message: '请输入资源描述', trigger: 'blur' }
        ],
        resourceType: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ],
        permissionFlag: [
          { required: true, message: '请选择数据权限', trigger: 'change' }
        ],
        databaseId: [
          { required: true, message: '请选择数据源', trigger: 'change' }
        ],
        querySql: [
          { required: true, message: '请输入sql', trigger: 'blur' }
        ]
      },
      tables: [], // 获取table
      params: [], // 获取参数
      paramsChecked: [], // 获取参数
      returns: [], // 获取返回值
      returnsChecked: [], // 获取返回值
      cloneData: {} // 备份修改数据
    }
  },
  methods: {
    // 上一页
    singleBefore() {
      this.dialogForm = this.dialogForm - 1
      this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
      if (this.dialogForm === 3) {
        this.returns = this.$refs.return.getParamsMenu()
        this.$nextTick(function() {
          this.$refs.param.getSelect()
        })
      }
    },
    // 获取数据源下拉
    getDatabaseSelect() {
      //   if (this.databaseSelect === null) {
      //     baseRequest('/resource/getDatabaseSelect').then(response => {
      //       this.databaseSelect = response.data.item
      //     })
      //   }
    },
    // 重置form
    resetForm(resourceId) {
      this.dialogForm = 1
      this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
      if (this.databaseSelect === null) {
        baseRequest('/basic/resource/getDatabaseSelect').then(response => {
          this.databaseSelect = response.data.item
        })
      }
      if (this.dialogStatus === 'update') {
        const param = { resourceId }
        baseRequest('/basic/resource/sqlTableUpdate', param).then(response => {
          const items = response.data.item.items
          this.cloneData = deepClone(items)
          for (const key in this.optionParam) {
            this.optionParam[key] = items[key] ? items[key] : null
          }
          const tables = response.data.item.tables
          for (const iterator of tables) {
            iterator.tableId = iterator.tableId ? iterator.tableId + '' : null
          }
          this.tables = tables
          this.params = response.data.item.params
          this.returns = response.data.item.returns
          this.querySql = response.data.item.querySql
        })
      } else {
        for (const key in this.optionParam) {
          this.optionParam[key] = ''
        }
        this.querySql = ''
      }
      this.$nextTick(function() {
        this.$refs.formOption.clearValidate()
      })
    },
    // 下一步 提交
    formSubmit() {
      if (this.dialogForm === 1) {
        this.$refs.formOption.validate((valid) => {
          if (valid) {
            if (this.dialogStatus === 'create') {
              baseRequest('/basic/resource/sqlTableParams', this.optionParam).then(response => {
                const tables = response.data.item.tables
                for (const iterator of tables) {
                  iterator.tableId = null
                }
                this.tables = tables
                this.params = response.data.item.params
                this.returns = response.data.item.returns
                this.querySql = response.data.item.querySql
                this.dialogForm = 2
                this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
              })
            } else {
              this.dialogForm = 2
              this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else if (this.dialogForm === 2) {
        console.log(this.tables)
        for (const iterator of this.tables) {
          if (iterator.tableId === null || iterator.tableId === '') {
            this.$Message.error('请选择table')
            return
          }
        }
        this.dialogForm = 3
        this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
      } else if (this.dialogForm === 3) {
        this.params = this.$refs.param.getParamsMenu()
        this.dialogForm = 4
        this.$nextTick(function() {
          this.$refs.return.getSelect()
        })
        this.$emit('changeSqlTitle', this.dialogTitle[this.dialogForm])
      } else {
        this.returns = this.$refs.return.getParamsMenu()
        const params = {}
        for (const key in this.optionParam) {
          params[key] = this.optionParam[key]
        }
        params.querySql = this.querySql
        params.params = this.params
        params.returns = this.returns
        for (const iterator of this.tables) {
          delete iterator.optionMap
          delete iterator.table
        }
        params.tables = this.tables
        if (this.dialogStatus === 'create') {
          params.configMode = '2'
          baseRequest('/basic/resource/sqlAddSave', params).then(response => {
            this.$Message.success('操作成功')
            this.$emit('closeMask')
          })
        } else {
          baseRequest('/basic/resource/sqlUpdateSave', params).then(response => {
            this.$Message.success('操作成功')
            this.$emit('closeMask')
          })
        }
      }
    }
  }
}
</script>
<style scoped>
.sql-footer {
  padding: 10px 20px 20px;
  text-align: right;
  box-sizing: border-box;
  background-color: #f3f3f3;
}
.height-full {
  height: 100%;
}
</style>
