<template>
	
	<div class="full-screen">
		<div id="box-video">
			<!--<video id="fullscreen-video" class="full-screen" src="https://www.ilvideo.live/crippa-app/mp4/crippa-sixty/4k/crippa_sixty_lx_4k.mp4" autoplay loop></video>-->
			<video id="fullscreen-video" class="full-screen" :src="path" autoplay loop></video>
		</div>
	</div>

</template>

<script>
	export default {
		name: 'PageVideo',
		props: ['path'],
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	.full-screen {
		width: 100%;
		height: 100vh;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}
</style>
