<template>
	<div class="text-center my-5" id="box-buttons">
		<button class="btn btn-primary mx-3" @click="showVideo('remote')">Play remote video</button>
		<button class="btn btn-primary mx-3" @click="showVideo('local')">Play local video</button>
		<button class="btn btn-primary mx-3" @click="closeWindow">Close window</button>
	</div>
  <PageVideo v-if="show" :path="path" />
</template>

<script>
	import PageVideo from './components/PageVideo.vue'

	export default {
		name: 'App',
		data() {
			return {
				show: false,
				path: ''
			}
		},
		methods: {
			showVideo(type) {
				if (type == 'remote') {
					this.path = "https://www.ilvideo.live/crippa-app/mp4/crippa-sixty/4k/crippa_sixty_lx_4k.mp4"
				} else {
					this.path = "atom://crippa_sixty_lx_4k.mp4"
				}
				this.show = true
			},
			closeWindow() {
				window.close()
			}
		},
		components: {
			PageVideo
		}
	}
</script>

<style>
	body,
	#app {
		position: relative;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
	#box-buttons {
		position: absolute;
		bottom: 20px;
		left: 0;
		width: 100%;
		z-index: 2;
	}
</style>
