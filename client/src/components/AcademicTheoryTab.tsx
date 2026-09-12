import React from 'react';
import { BookOpen, GraduationCap, FileCode, CheckCircle2, ChevronRight } from 'lucide-react';

export const AcademicTheoryTab: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Syllabus Alignment Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-800/40 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-cyan-950 rounded-xl text-cyan-400 border border-cyan-800/60 shadow-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white m-0">
                Mathematics University Module: Statistical Techniques
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Viva & Exam Reference
              </span>
            </div>
            <p className="text-xs text-slate-300 m-0 mt-1 leading-relaxed">
              Curricular Objective: <em>"Model stock price trends using regression"</em>. Every computation in this dashboard is derived from fundamental analytical probability and statistics theorems without heuristic approximations.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Theoretical Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Topic 1: Bessel's Correction */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            1. Unbiased Sample Variance & Bessel's Correction
          </div>
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            Why divide by <code>(n - 1)</code> instead of <code>n</code>? Because the sample mean <code>?</code> is itself estimated from the data, it minimizes the sum of squared deviations for that specific sample. Calculating variance relative to <code>?</code> introduces negative bias:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
            E[ (1/n) ? (y? - ?)² ] = [(n - 1) / n] · s²
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            Multiplying by <code>n / (n - 1)</code> yields an unbiased estimator whose expected value equals the true population variance <code>s²</code>:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
            s² = [1 / (n - 1)] · ???1n (y? - ?)²
          </div>
        </div>

        {/* Topic 2: Bivariate Association */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            2. Covariance & Pearson Product-Moment Correlation
          </div>
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            Sample covariance quantifies directional co-movement between trading sessions <code>x</code> and price <code>y</code>. Its magnitude depends on data units (? · days):
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
            Cov(X, Y) = [1 / (n - 1)] · ? (x? - x¯)(y? - ?)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            Pearson’s <code>r</code> standardizes covariance by the product of both standard deviations, producing a scale-invariant metric bounded strictly in <code>[-1.0, +1.0]</code>:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300">
            r = Cov(X, Y) / (s_x · s_y) = ? (x? - x¯)(y? - ?) / v[ ? (x? - x¯)² · ? (y? - ?)² ]
          </div>
        </div>

        {/* Topic 3: OLS Analytical Derivation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            3. Ordinary Least Squares (OLS) Calculus Derivation
          </div>
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            OLS determines parameters <code>(a, b)</code> that minimize the Sum of Squared Residuals (SSR):
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
            S(a, b) = ???1n [y? - (a + b·x?)]²
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            Setting partial derivatives <code>?S/?a = 0</code> and <code>?S/?b = 0</code> produces the two classical normal equations:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
            <div>b = ? (x? - x¯)(y? - ?) / ? (x? - x¯)²</div>
            <div>a = ? - b · x¯</div>
          </div>
        </div>

        {/* Topic 4: Polynomial Normal Equations */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            4. Second-Degree Polynomial Regression Matrix Form
          </div>
          <p className="text-xs text-slate-300 leading-relaxed m-0">
            For quadratic curves <code>y^ = a + bx + cx²</code>, setting partial derivatives of SSR with respect to <code>(a, b, c)</code> to zero produces a 3×3 matrix normal equation:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
            + n       ?x    ?x² + + a +   + ?y   +<br/>
            ¦ ?x      ?x²   ?x³ ¦ ¦ b ¦ = ¦ ?xy  ¦<br/>
            + ?x²     ?x³   ?x4 + + c +   + ?x²y +
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">
            This linear system <code>(X?X)ß = X?Y</code> is solved directly using Gaussian elimination with partial row pivoting for numerical precision.
          </p>
        </div>

      </div>

      {/* Model Selection & R² Interpretation Note */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h4 className="text-sm font-bold text-white mb-2">Goodness-of-Fit (R²) & Decomposition of Sums of Squares</h4>
        <div className="font-mono text-xs text-cyan-300 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-3">
          SST = SSR + SSE &nbsp;?&nbsp; ?(y? - ?)² = ?(y^? - ?)² + ?(y? - y^?)²<br/>
          R² = 1 - (SSE / SST)
        </div>
        <p className="text-xs text-slate-300 leading-relaxed m-0">
          <code>R²</code> represents the proportion of total variance in NIFTY 50 prices explained by deterministic time progression. Because a polynomial model possesses 3 degrees of freedom compared to 2 for a line, its <code>R²</code> is mathematically guaranteed to be greater than or equal to the linear <code>R²</code>. In financial practice, parsimony (Occam's razor) is balanced against curvature to prevent overfitting noisy market fluctuations.
        </p>
      </div>

    </div>
  );
};
