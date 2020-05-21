<template>
  <div>
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
      <div v-show="searchToggle"
           class="form-search">
        <el-form :inline="true"
                 class="demo-table-expand">
          <div class="input-both-3">
            <el-form-item>
              <span class="input-label">请求路径</span>
              <el-input style="width:250px"
                        v-model="pathUrl"
                        clearable></el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <a @click="tableToggle=false"
             v-if="tableToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <div>
        <el-table :data="data"
                  v-show="tableToggle"
                  border
                  :height="tableHeight"
                  stripe>
          <el-table-column
            type="index"
            width="50">
            </el-table-column>
          <el-table-column align="center" label="URL" prop="url">
               <template slot-scope="scope">
              <el-tooltip :disabled="textJug(scope.row.url)" :content="scope.row.url" placement="top" visible-arrow effect="light">
                <div class="basic-table-column">
                  {{ scope.row.url}}
                </div>
              </el-tooltip>
            </template>  
            </el-table-column>
          <el-table-column align="center" label="参数" prop="params">
              <template slot-scope="scope">
              <el-tooltip :disabled="textJug(scope.row.params)" :content="scope.row.params" placement="top" visible-arrow effect="light">
                <div class="basic-table-column">
                  {{ scope.row.params}}
                </div>
              </el-tooltip>
            </template>  
            </el-table-column>
          <el-table-column label="操作"
                           width="250"
                           fixed="right"
                           align="center">
            <template slot-scope="scope">
              <el-button size="mini"
                         plain
                         type="danger"
                         @click="deleteForm(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'cacheDataIndex',
  data() {
    return {
      pathUrl: '',
      tableHeight: 0,
      searchToggle: true,
      tableToggle: true,
      data: []
    }
  },
  created() {
    this.getOption()
  },
  mounted() {
    this.getTableHeight()
  },
  watch: {
    searchToggle() {
      this.getTableHeight()
    }
  },
  methods: {
    // 判断字数提示
    textJug(text) {
      if (text) {
        if (text.length > 20) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    getTableHeight() {
      this.$nextTick(_ => {
        const formDom = document.querySelector('.form-search')
        const formHeight = formDom ? formDom.offsetHeight : 0
        this.tableHeight = this.$store.state.app.containHeight - formHeight - 130
      })
    },
    searchOption() {
      this.data = this.$store.state.app.cacheData.filter(item => item.url.indexOf(this.pathUrl) !== -1)
    },
    // 删除
    deleteForm(row) {
      this.$confirm('此操作将删除该请求的缓存, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('deleteCacheData', [row]).then(_ => {
          this.searchOption()
          this.$message.success('删除成功')
        })
      }).catch(() => {
      })
    },
    getOption() {
      this.pathUrl = ''
      this.data = this.$store.state.app.cacheData
    }
  }
}
</script>
