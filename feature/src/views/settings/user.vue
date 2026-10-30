<template>
  <div class="box-border w-full overflow-x-hidden">
    <!-- todo 暂时先去掉登录，等小程序做好了再加回来吧 -->
    <!--    <GEmpty-->
    <!--      v-if="!userInfo"-->
    <!--      title="请先登录"-->
    <!--      description="登录后可开启用户个性化设置"-->
    <!--    >-->
    <!--      <template #action>-->
    <!--        <GButton @click="showModal" variant="primary">-->
    <!--          使用微信小程序登录-->
    <!--        </GButton>-->
    <!--      </template>-->
    <!--    </GEmpty>-->
    <Index />
    <GModal v-model="visible">
      <GEmpty
        title="请使用微信扫码登录!"
        description="使用微信扫描上面的 rubick 小程序二维码进行授权登录"
      >
        <template #icon>
          <img width="200" :src="imgCode" />
        </template>
      </GEmpty>
    </GModal>
  </div>
</template>

<script setup>
import { nanoid } from 'nanoid';
import { ref, watch } from 'vue';
import { GEmpty, GModal, toast } from '@/components/ui';
import service from '../../assets/service';
import Index from './index';

const userInfo = ref(window.rubick.dbStorage.getItem('rubick-user-info'));

const imgCode = ref('');
const scene = nanoid();

const visible = ref(false);
const showModal = () => {
  visible.value = true;
  if (!imgCode.value && !userInfo.value) {
    service.getScanCode({ scene }).then((res) => {
      imgCode.value = `data:image/png;base64,${res.dataUrl}`;
    });
  }
};

let timer = null;
watch([visible], () => {
  if (visible.value) {
    timer = setInterval(() => {
      service.checkLoginStatus({ scene }).then((res) => {
        console.log(res);
        if (res.openId) {
          window.rubick.dbStorage.setItem('rubick-user-info', res);
          userInfo.value = res;
          toast.success('登录成功！');
          visible.value = false;
          clearInterval(timer);
          timer = null;
        }
      });
    }, 2000);
  } else {
    clearInterval(timer);
    timer = null;
  }
});
</script>
