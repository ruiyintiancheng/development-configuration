<template>
  <div>
    <el-dialog title="查看消息"
               v-el-drag-dialog
               append-to-body
               :visible.sync="formVisible"
               width="78%"
               custom-class="dialog-default no-footer">
      <div class="dialog-contant-default">
        <el-form ref="formData"
                 v-if="formVisible"
                 v-loading="downloadLoading"
                 element-loading-text="文件下载中，请稍后"
                 :model="formData"
                 style="padding:30px"
                 label-width="80px">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="标题:">
                <el-input :readonly="true"
                          v-model="formData.notice_title"
                          style="width: 250px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="概述:">
                <el-input :readonly="true"
                          v-model="formData.summary"
                          style="width: 250px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="正文">
            <tinymce :height="300"
                     v-model="formData.content"
                     :noRead="1"
                     :menubar="false"
                     :toolbar="['fullscreen']"></tinymce>
          </el-form-item>
          <el-form-item label="附件">
            <el-upload class="upload-demo"
                       ref="upload"
                       disabled
                       multiple
                       action=""
                       :on-preview="downloadHandle"
                       :file-list="fileList">
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import { download } from '@/utils/download'
import Tinymce from '@/components/Tinymce'
export default {
  components: {
    Tinymce
  },
  data() {
    return {
      formVisible: false, // 弹框开关
      fileList: [],
      formData: {
        notice_title: null,
        summary: null,
        content: null
      },
      toolbar: ['fullscreen'],
      downloadLoading: false
    }
  },
  methods: {
    // 查看表单
    seeView(row) {
      for (const key in row) {
        if (this.formData.hasOwnProperty(key)) {
          this.formData[key] = row[key]
        }
      }
      this.fileList = []
      baseRequest('/basic/notices/getFileList', { relationId: row.notice_id }).then(response => {
        const list = response.data.item
        for (const iterator of list) {
          const item = {}
          item.name = iterator.file_name
          item.id = iterator.file_id
          this.fileList.push(item)
        }
        this.formVisible = true
        // 添加查看记录
        baseRequest('/basic/notices/addNoticeLog', { noticeId: row.notice_id }).then(() => {
          this.$emit('getNewsCount')
        })
      })
    },
    // 点击下载
    downloadHandle(file) {
      this.downloadLoading = true
      download('/basic/files/download', { fileId: file.id }, () => {
        this.downloadLoading = false
      }, () => {
        this.downloadLoading = false
      })
    }
  }
}
</script>
