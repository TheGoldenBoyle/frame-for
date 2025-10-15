module.exports = function (api) {
	api.cache(true)
	return {
		presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
		plugins: ["nativewind/babel", "transform-inline-environment-variables"],
	}
}
