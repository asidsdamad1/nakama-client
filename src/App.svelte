<script>
	import MainMenu from "./scenes/MainMenu";
	import Matchmaking from "./scenes/Matchmaking";
	import InGame from "./scenes/InGame";
	import ListMatch from "./scenes/ListMatch";

	import CONFIG from "./config";

	const config = {
		type: Phaser.AUTO,
		width: CONFIG.WIDTH,
		height: CONFIG.HEIGHT,
		backgroundColor: "#FF4C4C",
		scene: [MainMenu, Matchmaking, InGame, ListMatch],
	};

	new Phaser.Game(config);
</script>
