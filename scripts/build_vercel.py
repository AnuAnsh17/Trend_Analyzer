"""
Build script to package the NIFTY 50 Statistical Trend Analyzer for Vercel deployment.
Generates public/index.html using stlite (Streamlit WebAssembly) so it can run
serverlessly on Vercel with 100% uptime, zero timeout limits, and instant CDN delivery.
"""
import os
import json
from pathlib import Path

def build_stlite_package():
    root = Path(__file__).resolve().parent.parent
    public_dir = root / "public"
    public_dir.mkdir(parents=True, exist_ok=True)

    files_dict = {}

    # Target files to include in virtual filesystem
    target_files = [
        "app.py",
        "data/processed/nifty50_processed.csv",
        "src/__init__.py",
        "src/data/__init__.py",
        "src/data/provider.py",
        "src/data/yfinance_provider.py",
        "src/data/preprocessing.py",
        "src/statistics/__init__.py",
        "src/statistics/descriptive.py",
        "src/statistics/covariance.py",
        "src/statistics/correlation.py",
        "src/regression/__init__.py",
        "src/regression/linear.py",
        "src/regression/quadratic.py",
        "src/regression/evaluation.py",
        "src/analysis/__init__.py",
        "src/analysis/period_analysis.py",
        "src/analysis/trend.py",
        "src/visualization/__init__.py",
        "src/visualization/plots.py",
    ]

    for rel_path in target_files:
        full_path = root / rel_path
        if full_path.exists():
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            # stlite uses posix style paths
            posix_path = rel_path.replace("\\", "/")
            files_dict[posix_path] = content
        else:
            print(f"Warning: {rel_path} not found.")

    files_json = json.dumps(files_dict)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <title>NIFTY 50 Statistical Trend Analyzer</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@stlite/mountable@0.73.1/build/stlite.css" />
  <style>
    body, html {{
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
      background-color: #f8fafc;
    }}
    #root {{
      height: 100%;
      width: 100%;
    }}
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdn.jsdelivr.net/npm/@stlite/mountable@0.73.1/build/stlite.js"></script>
  <script>
    const files = {files_json};

    stlite.mount({{
      requirements: ["pandas", "numpy", "scipy", "scikit-learn", "plotly"],
      entrypoint: "app.py",
      files: files
    }}, document.getElementById("root"));
  </script>
</body>
</html>
"""

    index_path = public_dir / "index.html"
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Successfully generated Vercel stlite bundle at: {index_path} ({len(files_dict)} files bundled)")

if __name__ == "__main__":
    build_stlite_package()
