import React from 'react';

export const MethodologyTab: React.FC = () => {
  return (
    <div className="bg-white border border-slate-300 p-8 max-w-4xl">
      <h1 className="text-xl font-bold tracking-widest text-slate-900 border-b border-slate-200 pb-4 mb-8">METHODOLOGY & STATISTICAL FORMULAS</h1>
      
      <div className="space-y-8 font-serif text-slate-800 leading-relaxed">
        
        <section>
          <h3 className="font-sans text-sm font-bold tracking-widest text-indigo-800 mb-2">1. DESCRIPTIVE STATISTICS</h3>
          <p className="mb-2"><strong>Mean (y¯):</strong> The arithmetic average of the closing prices.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            y¯ = (? y_i) / n
          </div>
          <p className="mb-2"><strong>Sample Variance (s²):</strong> Bessel-corrected variance.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            s² = ? (y_i - y¯)² / (n - 1)
          </div>
          <p className="mb-2"><strong>Standard Deviation (s):</strong> Square root of variance, measuring dispersion.</p>
        </section>

        <section>
          <h3 className="font-sans text-sm font-bold tracking-widest text-indigo-800 mb-2">2. BIVARIATE ASSOCIATION</h3>
          <p className="mb-2"><strong>Covariance (cov_xy):</strong> Joint variability of time (x) and price (y).</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            cov(x,y) = ? (x_i - x¯)(y_i - y¯) / (n - 1)
          </div>
          <p className="mb-2"><strong>Pearson Correlation Coefficient (r):</strong> Normalized measure of linear correlation.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            r = cov(x,y) / (s_x * s_y)
          </div>
        </section>

        <section>
          <h3 className="font-sans text-sm font-bold tracking-widest text-indigo-800 mb-2">3. LINEAR REGRESSION (OLS)</h3>
          <p className="mb-2">Ordinary Least Squares minimizes the sum of squared residuals to fit a line.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            y^ = a + bx<br/>
            b (slope) = ? (x_i - x¯)(y_i - y¯) / ? (x_i - x¯)²<br/>
            a (intercept) = y¯ - b(x¯)
          </div>
        </section>

        <section>
          <h3 className="font-sans text-sm font-bold tracking-widest text-indigo-800 mb-2">4. QUADRATIC REGRESSION</h3>
          <p className="mb-2">Fits a second-degree polynomial by solving the normal equations (X?X)ß = X?Y.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            y^ = a + bx + cx²
          </div>
        </section>

        <section>
          <h3 className="font-sans text-sm font-bold tracking-widest text-indigo-800 mb-2">5. GOODNESS OF FIT & ERRORS</h3>
          <p className="mb-2"><strong>Coefficient of Determination (R²):</strong> Proportion of variance explained by the model.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block mb-4">
            R² = 1 - (SS_res / SS_tot)<br/>
            SS_res = ? (y_i - y^_i)²<br/>
            SS_tot = ? (y_i - y¯)²
          </div>
          <p className="mb-2"><strong>Root Mean Square Error (RMSE):</strong> Standard deviation of the residuals.</p>
          <div className="bg-slate-50 p-3 font-mono text-sm border border-slate-200 inline-block">
            RMSE = v[ ? (y_i - y^_i)² / n ]
          </div>
        </section>

      </div>
    </div>
  );
};
