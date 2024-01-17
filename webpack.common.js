import path from "path";

const loaders = [
  // loader for jsx
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: "babel-loader"
  },
  // loaders for css
  {
    test: /\.css$/,
    use: [
            'style-loader',
            'css-loader'
          ]
  },
  // loaders for typescript
  {
    test: /\.(ts|tsx)$/,
    use: 'ts-loader',
    exclude: /node_modules/,
  },
  {
    test: /\.(jpe?g|png|gif|svg)$/i,
    use: 'file-loader'
  },
  {
    test: /\.test.(j|t)sx?$/,
    use: "ts-jest"
  }
];


export default {
  entry: {
    app: "./client/index.tsx" // should be app: ?
  },
  module: {
    rules: loaders
  },
  output: {
    filename: "main.bundle.js",
    path: path.resolve(path.resolve(), "dist")
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.svg', '.css'],
  }
}