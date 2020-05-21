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
          <el-button icon="el-icon-plus"
                     @click="addOption">加载附件3模板</el-button>
          <el-button icon="el-icon-plus"
                     @click="addOption">加载附件4模板</el-button>
          <el-button icon="el-icon-plus"
                     @click="addOption">加载报备说明模板</el-button>
          <a @click="tableToggle=false"
             v-if="tableToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <tree-table v-if="tableToggle"
                  :data="treeTableData"
                  border>
        <el-table-column label="模板名称"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       @click="looklSql(scope.row)">{{scope.row.模板名称}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="添加日期"
                         align="center">
          <template slot-scope="scope">
            {{scope.row.添加日期}}
          </template>
        </el-table-column>
        <el-table-column label="最近一次修改日期"
                         align="center">
          <template slot-scope="scope">
            {{scope.row.添加日期}}
          </template>
        </el-table-column>
        <el-table-column label="数据版本日期"
                         align="center">
          <template slot-scope="scope">
            {{scope.row.数据版本日期}}
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="200"
                         fixed="right"
                         align="center">
          <template slot-scope="scope">
            <el-button v-if="scope.row.最近一次修改日期 === ''"
                       type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button v-if="scope.row.最近一次修改日期 === ''"
                       size="mini"
                       plain
                       type="danger"
                       @click="handleDelete(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </tree-table>

    </div>
    <el-dialog :title="attachment3"
               v-el-drag-dialog
               :close-on-click-modal='false'
               :visible.sync="formVisible"
               width="80%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>数据列表</span>
            </div>
            <div class="row-option">
              <el-button icon="el-icon-plus"
                         @click="addOption">复制为新模板</el-button>
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
          </basic-table>
        </div>
      </div>
    </el-dialog>

    <el-dialog :title="attachment3"
               :visible.sync="formVisible2"
               width="80%"
               custom-class="dialog-default"
               v-el-drag-dialog
               :close-on-click-modal='false'>
      <div class="dialog-contant-default">
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>数据列表</span>
            </div>
            <div class="row-option">
              <el-button icon="el-icon-plus"
                         @click="addOption">复制为新模板</el-button>
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
            <template slot="optionColumn">
              <el-table-column label="备注"
                               align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.edit">
                    <el-input class="edit-input"
                              v-model="scope.row.备注"></el-input>
                  </template>
                  <span v-else>{{ scope.row.备注 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作"
                               align="center"
                               fixed="right"
                               width="200">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.edit"
                             type="success"
                             plain
                             @click="confirmEdit(scope.row)"
                             size="mini"
                             icon="el-icon-circle-check-outline">保存</el-button>
                  <el-button v-else
                             type="primary"
                             plain
                             size="mini"
                             icon="el-icon-edit"
                             @click="biginEdit(scope.row)">编辑</el-button>
                  <el-button v-if="scope.row.edit"
                             class='cancel-btn'
                             plain
                             size="mini"
                             icon="el-icon-refresh"
                             type="warning"
                             @click="cancelEdit(scope.row)">取消</el-button>
                </template>
              </el-table-column>
            </template>
          </basic-table>
        </div>
      </div>
    </el-dialog>

    <el-dialog :title="attachment3"
               :visible.sync="formVisible3"
               width="80%"
               custom-class="dialog-default"
               v-el-drag-dialog
               :close-on-click-modal='false'>
      <div class="dialog-contant-default">
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>数据列表</span>
            </div>
            <div class="row-option">
              <el-button icon="el-icon-plus"
                         @click="addOption">复制为新模板</el-button>
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
            <template slot="optionColumn">
              <el-table-column label="源系统名称"
                               align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.edit">
                    <el-input class="edit-input"
                              v-model="scope.row.源系统名称"></el-input>
                  </template>
                  <span v-else>{{ scope.row.源系统名称 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="空值原因"
                               align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.edit">
                    <el-input class="edit-input"
                              v-model="scope.row.空值原因"></el-input>
                  </template>
                  <span v-else>{{ scope.row.空值原因 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="解决方案"
                               align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.edit">
                    <el-input class="edit-input"
                              v-model="scope.row.解决方案"></el-input>
                  </template>
                  <span v-else>{{ scope.row.解决方案 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="解决进度"
                               align="center">
                <template slot-scope="scope">
                  <template v-if="scope.row.edit">
                    <el-input class="edit-input"
                              v-model="scope.row.解决进度"></el-input>
                  </template>
                  <span v-else>{{ scope.row.解决进度 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作"
                               align="center"
                               fixed="right"
                               width="200">
                <template slot-scope="scope">
                  <el-button v-if="scope.row.edit"
                             type="success"
                             plain
                             @click="confirmEdit(scope.row)"
                             size="mini"
                             icon="el-icon-circle-check-outline">保存</el-button>
                  <el-button v-else
                             type="primary"
                             plain
                             size="mini"
                             icon="el-icon-edit"
                             @click="biginEdit2(scope.row)">编辑</el-button>
                  <el-button v-if="scope.row.edit"
                             class='cancel-btn'
                             plain
                             size="mini"
                             icon="el-icon-refresh"
                             type="warning"
                             @click="cancelEdit2(scope.row)">取消</el-button>
                </template>
              </el-table-column>
            </template>
          </basic-table>
        </div>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import TreeTable from '@/components/TreeTable'
import elDragDialog from '@/directive/el-dragDialog'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
const url = '/basic/attachmentManagement/selects'
export default {
  name: 'rulesManageIndex',
  directives: { elDragDialog },
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
    TreeTable
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      treeTableData: [],
      formVisible: false,
      formVisible2: false,
      formVisible3: false,
      configDataCheck: null,
      firstColumnDialog: false,
      operateStatus: null, // 操作选项
      msgId: null, // 修改保存参数id
      attachment3: '',
      editData: {
        备注: ''
      },
      editData2: {
        源系统名称: '',
        空值原因: '',
        解决方案: '',
        解决进度: ''
      },
      updateFormData: null, // 弹框数据
      textarea: null,
      tableName: null
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      baseRequest(url).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        //        result.tableConfig = JSON.parse(result.tableConfig)
        this.treeTableData = result.item
        this.configData = result
      })
    },
    getOption() {
      this.searchOption()
    },
    // 修改
    updateOption(row) {
      this.operateStatus = 2
      this.attachment3 = ' 修改 ' + row.模板名称
      if (row.模板名称 === '附件3_20180830' || row.模板名称 === '附件3_20180731') {
        this.formVisible2 = true
        baseRequest('/basic/attachmentManagement/update').then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData('/basic/attachmentManagement/update', param)
        })
      } else {
        this.formVisible3 = true
        baseRequest('/basic/attachmentManagement4/update').then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData('/basic/attachmentManagement4/update', param)
        })
      }
    },
    // 查看sql
    looklSql(row) {
      this.formVisible = true
      this.attachment3 = ' 查看 ' + row.模板名称
      if (row.模板名称 === '附件3_20180830' || row.模板名称 === '附件3_20180731') {
        baseRequest('/basic/attachmentManagement/getName').then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData('/basic/attachmentManagement/getName', param)
        })
      } else {
        baseRequest('/basic/attachmentManagement4/selects').then(response => {
          const result = response.data
          result.formConfig = JSON.parse(result.formConfig)
          result.tableConfig = JSON.parse(result.tableConfig)
          this.configData = result
          const param = getSearchParam(result.formConfig)
          this.$refs.basicTable.getData('/basic/attachmentManagement4/selects', param)
        })
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
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    confirmEdit(row) {
      row.edit = false
    },
    biginEdit(row) {
      row.edit = true
      this.editData.备注 = row.备注
    },
    cancelEdit(row) {
      row.备注 = this.editData.备注
      row.edit = false
    },
    biginEdit2(row) {
      row.edit = true
      this.editData2.源系统名称 = row.源系统名称
      this.editData2.空值原因 = row.空值原因
      this.editData2.解决方案 = row.解决方案
      this.editData2.解决进度 = row.解决进度
    },
    cancelEdit2(row) {
      row.源系统名称 = this.editData2.源系统名称
      row.空值原因 = this.editData2.空值原因
      row.解决方案 = this.editData2.解决方案
      row.解决进度 = this.editData2.解决进度
      row.edit = false
    },
    addOption() {

    }
  }
}
</script>

