/*
  查询组件 - 表单
  wlq
  2019/9/3
 */
<template>
  <div class="dialog-contant-default resource-option-dialog"
       style="padding: 0">
    <el-form :model="resourceParams"
             ref="resourceParams"
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
                   @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="resourceData"
              border
              fit
              highlight-current-row
              stripe
              style="width: 100%;margin-top:5px;"
              :height="formDialogVueListHeight">
      <el-table-column width="55"
                       label="单选"
                       align="center">
        <template slot-scope="scope">
          <el-radio v-model="formResourceRadio"
                    :label="scope.row">&nbsp;</el-radio>
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
                     layout="total, sizes, prev, pager, next, jumper"
                     :current-page="resourceParams.pageNo"
                     :page-sizes="[10,20,30,50]"
                     :page-size="resourceParams.pageSize"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import { baseSearch } from '@/api/base'
export default {
  components: {
  },
  data() {
    return {
      operateStatus: null, // 操作选项
      paramId: null, // 修改保存参数id
      formResourceRadio: null, // 单选选中值
      resourceData: [],
      resourceParams: { // 表单参数
        resourceUrl: '',
        resourceDesc: '',
        pageSize: 10,
        pageNo: 1
      },
      total: null,
      formDialogVueListHeight: 0 // form选择vue属性列表高度
    }
  },
  created() {
    // this.getOption()
  },
  mounted() {
    this.getFormDialogHeight()
    this.getResourceData()
  },
  methods: {
    handleSearch() { // 查询
      this.getResourceData()
      this.resourceParams.pageNo = 1
    },
    handleSizeChange(val) { // 分页
      this.resourceParams.pageSize = val
      this.getResourceData()
    },
    handleCurrentChange(val) { // 分页
      this.resourceParams.pageNo = val
      this.getResourceData()
    },
    getOption() {
      return this.formResourceRadio
    },
    clearOption() { // 初始化
      this.formResourceRadio = null
      this.resourceParams.resourceUrl = ''
      this.resourceParams.resourceDesc = ''
      this.resourceParams.pageSize = 10
      this.resourceParams.pageNo = 1
      this.getResourceData()
    },
    getResourceData() { // 获取资源列表
      baseSearch('/basic/resource/getList', this.resourceParams).then(response => {
        this.resourceData = response.data.item
        this.resourceParams.pageSize = response.data.pageSize
        this.total = response.data.total
      })
    },
    // 保存操作
    saveOperate() {
      if (this.operateStatus === 1) {
        this.$refs.updateFrom.saveRequest('/resourceParams/add').then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      } else if (this.operateStatus === 2) {
        const param = this.$refs.updateFrom.getFormData()
        param.paramId = this.paramId
        this.$refs.updateFrom.saveRequest('/resourceParams/update', param).then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
        })
      }
    },
    // 获取form弹框高度
    getFormDialogHeight() {
      this.$nextTick(function() {
        this.formDialogVueListHeight = document.querySelector('.dialog-contant-default.resource-option-dialog').offsetHeight - 110
      })
    }
  }
}
</script>

