import { useState, useEffect } from 'react';
import { Client } from '@gradio/client';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import QueryForm from './components/QueryForm/QueryForm';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import MetricsBar from './components/MetricsBar/MetricsBar';
import FeatureCards from './components/FeatureCards/FeatureCards';
import OnboardingTour from './components/OnboardingTour/OnboardingTour';

const MODEL_KEYS = [
  { key: 'mixtral', label: 'Mixtral 8x7B' },
  { key: 'llama', label: 'Llama 3.1 8B' },
  { key: 'gemma', label: 'Gemma 2 27B' },
  { key: 'phi', label: 'Phi 3 14B' },
];

const SAMPLE_RESULTS = [
  {
    model: 'Mixtral 8x7B',
    response: `To install ROCm on Ubuntu 22.04, follow these steps:

1. Ensure your AMD GPU is supported (MI300X, RX 7900 XTX, etc.) and your kernel is ≥ 5.15.
2. Add the ROCm apt repository:
   wget https://repo.radeon.com/amdgpu-install/6.1/ubuntu/jammy/amdgpu-install_6.1.60101-1_all.deb
   sudo apt install ./amdgpu-install_6.1.60101-1_all.deb
3. Install ROCm:
   sudo amdgpu-install --usecase=rocm
4. Add your user to the render and video groups:
   sudo usermod -aG render,video $USER
5. Reboot, then verify:
   rocm-smi

Source: ROCm Installation Guide v6.1 — AMD Documentation`,
    metrics: { 'Input Tokens': 48, 'Output Tokens': 142, 'Retrieval Time': '0.28s', 'Inference Time': '3.12s', 'Tokens/Second': '45.5', 'Total Time': '3.40s', 'Sources Used': 4 },
  },
  {
    model: 'Llama 3.1 8B',
    response: `Installing ROCm on Ubuntu 22.04 is straightforward with the official installer:

Step 1 — Register the ROCm repository:
  sudo apt update && sudo apt install wget gnupg
  wget -q -O - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -

Step 2 — Install the amdgpu driver + ROCm stack:
  sudo amdgpu-install --usecase=rocm --no-dkms

Step 3 — Configure group permissions and reboot:
  sudo usermod -aG video,render $(whoami) && sudo reboot

After reboot, run \`rocminfo\` to confirm your GPU is detected.

Tip: Use \`--usecase=rocm,hip\` if you also need HIP headers for development.`,
    metrics: { 'Input Tokens': 48, 'Output Tokens': 118, 'Retrieval Time': '0.31s', 'Inference Time': '1.84s', 'Tokens/Second': '64.1', 'Total Time': '2.15s', 'Sources Used': 3 },
  },
  {
    model: 'Gemma 2 27B',
    response: `ROCm installation on Ubuntu 22.04 (Jammy) requires a few prerequisites before the main install:

Prerequisites:
• Kernel ≥ 5.15 (check with \`uname -r\`)
• A supported AMD GPU — MI300X, MI250X, RX 7900 series, or Radeon Pro W7000 series
• At least 16 GB of system RAM recommended

Installation:
1. Download and install the amdgpu-install package from repo.radeon.com
2. Run: sudo amdgpu-install --usecase=rocm
3. This installs the AMDGPU driver, ROCm runtime, HIP, rocBLAS, MIOpen, and related libraries
4. Add user to groups: sudo usermod -aG render video $LOGNAME

Verification:
  rocm-smi        — shows GPU utilization and memory
  rocminfo        — lists compute devices and capabilities
  hipconfig       — confirms HIP installation details`,
    metrics: { 'Input Tokens': 48, 'Output Tokens': 163, 'Retrieval Time': '0.33s', 'Inference Time': '4.61s', 'Tokens/Second': '35.4', 'Total Time': '4.94s', 'Sources Used': 5 },
  },
  {
    model: 'Phi 3 14B',
    response: `Quick ROCm install on Ubuntu 22.04:

  # 1. Get the installer
  wget https://repo.radeon.com/amdgpu-install/6.1/ubuntu/jammy/amdgpu-install_6.1.60101-1_all.deb
  sudo apt install ./amdgpu-install_6.1.60101-1_all.deb

  # 2. Install ROCm (and optionally PyTorch/ML libs)
  sudo amdgpu-install --usecase=rocm        # base ROCm
  sudo amdgpu-install --usecase=rocm,hip    # + HIP dev headers
  sudo amdgpu-install --usecase=mlsdk       # + ML frameworks

  # 3. User groups
  sudo usermod -aG render,video $USER && sudo reboot

  # 4. Verify
  rocm-smi --showproductname

For PyTorch: pip install torch torchvision --index-url https://download.pytorch.org/whl/rocm6.1`,
    metrics: { 'Input Tokens': 48, 'Output Tokens': 109, 'Retrieval Time': '0.24s', 'Inference Time': '2.03s', 'Tokens/Second': '53.7', 'Total Time': '2.27s', 'Sources Used': 4 },
  },
];

const DEFAULT_METRICS = [
  { label: 'LLMs Running', value: 4, suffix: '' },
  { label: 'GPU Memory', value: 192, suffix: 'GB' },
  { label: 'ROCm Doc Pages', value: 36, suffix: '' },
  { label: 'HBM3 Bandwidth', value: 5300, suffix: 'GB/s' },
];

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('rocm_theme') || 'dark'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [sessionMetrics, setSessionMetrics] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rocm_theme', theme);
  }, [theme]);

  const handleSample = () => {
    setError(null);
    setResults(SAMPLE_RESULTS);
    setSessionMetrics(null);
  };

  const handleSubmit = async (question) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const client = await Client.connect('http://localhost:7863');
      const result = await client.predict('/process_question', { question });

      const data = result.data;

      const modelResults = MODEL_KEYS.map((m, i) => ({
        model: m.label,
        response: data[i * 2] ?? 'No response received.',
        metrics: data[i * 2 + 1] ?? {},
      }));

      setResults(modelResults);
      setSessionMetrics({ session: data[8], system: data[9] });
    } catch (err) {
      setError(err?.message || 'Could not reach backend on port 7863.');
    } finally {
      setLoading(false);
    }
  };

  const avgTokensPerSec = results
    ? results.reduce((sum, r) => {
        const v = parseFloat(r.metrics?.['Tokens/Second'] ?? 0);
        return sum + (isNaN(v) ? 0 : v);
      }, 0) / results.length
    : 0;

  const activeMetrics = results
    ? [
        { label: 'LLMs Queried', value: 4, suffix: '' },
        { label: 'Avg Tokens/s', value: Math.round(avgTokensPerSec), suffix: '' },
        {
          label: 'Sources Used',
          value: Number(results[0]?.metrics?.['Sources Used'] ?? 0),
          suffix: '',
        },
        { label: 'GPU Memory', value: 192, suffix: 'GB' },
      ]
    : DEFAULT_METRICS;

  return (
    <>
      <Header />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <QueryForm onSubmit={handleSubmit} onSample={handleSample} loading={loading} />
        <MetricsBar metrics={activeMetrics} />
        {(loading || results || error) && (
          <ResultsPanel results={results} loading={loading} error={error} />
        )}
        <FeatureCards />
      </main>
      <Footer />
      <OnboardingTour
        theme={theme}
        onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
    </>
  );
}
