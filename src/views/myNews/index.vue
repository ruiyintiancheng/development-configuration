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
                   :height="tableHeight"
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <template slot="firstColumn">
          <el-table-column label="标题"
                           fixed="left"
                           align="center">
            <template slot-scope="scope">
              <el-button type="text"
                         @click="seeView(scope.row)">{{scope.row.notice_title}}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="概述"
                           align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.user_id">{{scope.row.summary}}</span>
              <b v-else
                 style="color:#000;">{{scope.row.summary}}</b>
            </template>
          </el-table-column>
        </template>
      </basic-table>
    </div>
    <news-detail ref="newsDetail"
                 @getNewsCount="getNewsCount"></news-detail>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import NewsDetail from './components/NewsDetail'
const url = '/basic/notices/myNewsList'
export default {
  name: 'myNewsIndex',
  components: {
    SearchForm,
    BasicTable,
    NewsDetail
  },
  data() {
    return {
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true
    }
  },
  computed: {
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 310
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
      baseRequest(url, { 'urlMode': '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(function() {
          this.searchOption()
        })
      })
    },
    // 查看表单
    seeView(row) {
      this.$refs.newsDetail.seeView(row)
    },
    getNewsCount() {
      this.searchOption()
      this.$emit('getNewsCount')
    }
  }
}
</script>







