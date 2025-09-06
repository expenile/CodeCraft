import React, { useState, useMemo, useCallback } from 'react'
import Navbar from '../components/Navbar'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from 'react-select';
import { BsStars } from 'react-icons/bs';
import { HiOutlineCode } from 'react-icons/hi';
import { IoCloseSharp, IoCopy } from 'react-icons/io5';
import { PiExportBold } from 'react-icons/pi';
import { ImNewTab } from 'react-icons/im';
import { FiRefreshCcw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTheme } from '../hooks/useTheme';
import { useRateLimit, useInputValidation, useCodeManager } from '../hooks/useCustomHooks';
import aiService from '../services/aiService';

// Lazy load Monaco Editor
const Editor = React.lazy(() => import('@monaco-editor/react'));

const Home = () => {
  const { isDark } = useTheme();
  const { isAllowed } = useRateLimit();
  const { validatePrompt, validateApiKey } = useInputValidation();
  const { copyCode, downloadFile } = useCodeManager();

  // Framework options with memoization
  const options = useMemo(() => [
    { value: 'html-css', label: 'HTML + CSS' },
    { value: 'html-tailwind', label: 'HTML + Tailwind CSS' },
    { value: 'html-bootstrap', label: 'HTML + Bootstrap' },
    { value: 'html-css-js', label: 'HTML + CSS + JS' },
    { value: 'html-tailwind-bootstrap', label: 'HTML + Tailwind + Bootstrap' },
  ], []);

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoized select styles based on theme
  const selectStyles = useMemo(() => ({
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? "#161621" : "#ffffff",
      borderColor: isDark ? "#374151" : "#d1d5db",
      borderWidth: "2px",
      color: isDark ? "#fff" : "#000",
      boxShadow: "none",
      "&:hover": { borderColor: isDark ? "#6b7280" : "#9ca3af" },
      "&:focus": { borderColor: "#3b82f6" }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#161621" : "#ffffff",
      color: isDark ? "#fff" : "#000",
      border: isDark ? "1px solid #374151" : "1px solid #d1d5db",
      boxShadow: isDark ? "0 4px 6px -1px rgb(0 0 0 / 0.1)" : "0 4px 6px -1px rgb(0 0 0 / 0.1)"
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? (isDark ? "#2a2a3a" : "#f3f4f6")
          : (isDark ? "#161621" : "#ffffff"),
      color: state.isSelected ? "#fff" : (isDark ? "#fff" : "#000"),
      "&:active": { backgroundColor: "#3b82f6" }
    }),
    singleValue: (base) => ({ ...base, color: isDark ? "#fff" : "#000" }),
    placeholder: (base) => ({ ...base, color: isDark ? "#a1a1aa" : "#6b7280" }),
    input: (base) => ({ ...base, color: isDark ? "#fff" : "#000" })
  }), [isDark]);

  // Generate code with all validations
  const getResponse = useCallback(async () => {
    // Rate limiting check
    if (!isAllowed()) return;

    // Validate API key
    const apiKeyValidation = validateApiKey(import.meta.env.VITE_GOOGLE_API_KEY);
    if (!apiKeyValidation.isValid) {
      toast.error(apiKeyValidation.error);
      return;
    }

    // Validate prompt
    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.isValid) {
      toast.error(promptValidation.error);
      return;
    }

    try {
      setLoading(true);
      const generatedCode = await aiService.generateComponent(
        promptValidation.sanitized, 
        frameWork.value
      );
      setCode(generatedCode);
      setOutputScreen(true);
      toast.success("Component generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong while generating code");
    } finally {
      setLoading(false);
    }
  }, [prompt, frameWork.value, isAllowed, validatePrompt, validateApiKey]);

  // Memoized handlers
  const handleCopyCode = useCallback(() => {
    copyCode(code);
  }, [code, copyCode]);

  const handleDownloadFile = useCallback(() => {
    downloadFile(code);
  }, [code, downloadFile]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleNewTab = useCallback(() => {
    setIsNewTabOpen(true);
  }, []);

  const handleCloseNewTab = useCallback(() => {
    setIsNewTabOpen(false);
  }, []);

  return (
    <>
      <Navbar />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-6 lg:px-16">
        {/* Left Section */}
        <div className="w-full py-6 rounded-xl bg-[var(--secondary-bg)] mt-5 p-5 transition-all duration-300 hover:shadow-lg border border-[var(--border-color)]">
          <h3 className='text-[25px] font-semibold sp-text'>CodeCraft AI Generator</h3>
          <p className='text-[var(--text-secondary)] mt-2 text-[16px]'>Describe your component and let AI code it for you.</p>

          <p className='text-[15px] font-[700] mt-4 text-[var(--text-primary)]'>Framework</p>
          <Select
            className='mt-2'
            options={options}
            value={frameWork}
            styles={selectStyles}
            onChange={(selected) => setFrameWork(selected)}
            isSearchable={false}
          />

          <p className='text-[15px] font-[700] mt-5 text-[var(--text-primary)]'>Describe your component</p>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className='w-full min-h-[200px] rounded-xl bg-[var(--input-bg)] border-2 border-[var(--border-color)] mt-3 p-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] resize-none transition-all duration-200'
            placeholder="Describe your component in detail and AI will generate it..."
            maxLength={1000}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <p className='text-[var(--text-secondary)] text-sm'>Click generate to get your code</p>
              <p className='text-xs text-[var(--text-secondary)] mt-1'>
                {prompt.length}/1000 characters
              </p>
            </div>
            <button
              onClick={getResponse}
              disabled={loading || !prompt.trim()}
              className="flex items-center p-3 rounded-lg border-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-5 gap-2 transition-all hover:opacity-80 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <BsStars />
              )}
              Generate
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="relative mt-2 w-full h-[80vh] bg-[var(--secondary-bg)] border-2 border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
             style={{ boxShadow: 'var(--shadow)' }}>
          {!outputScreen ? (
            <div className="w-full h-full flex items-center flex-col justify-center">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="p-5 w-[70px] flex items-center justify-center text-[30px] h-[70px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse shadow-lg">
                    <HiOutlineCode />
                  </div>
                  <p className='text-[16px] text-[var(--text-secondary)] mt-3'>Your component & code will appear here.</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="bg-[var(--tertiary-bg)] border-b border-[var(--border-color)] w-full h-[50px] flex items-center gap-3 px-3">
                <button
                  onClick={() => setTab(1)}
                  className={`w-1/2 py-2 rounded-lg transition-all border ${
                    tab === 1 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-blue-500" 
                      : "bg-[var(--secondary-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] border-[var(--border-color)]"
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`w-1/2 py-2 rounded-lg transition-all border ${
                    tab === 2 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg border-blue-500" 
                      : "bg-[var(--secondary-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] border-[var(--border-color)]"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-[var(--tertiary-bg)] border-b border-[var(--border-color)] w-full h-[50px] flex items-center justify-between px-4">
                <p className='font-bold text-[var(--text-primary)]'>Code Editor</p>
                <div className="flex items-center gap-2">
                  {tab === 1 ? (
                    <>
                      <button 
                        onClick={handleCopyCode} 
                        className="w-10 h-10 rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--hover-bg)] hover:border-purple-500 transition-all hover:scale-110 text-[var(--text-primary)]"
                        title="Copy code"
                      >
                        <IoCopy />
                      </button>
                      <button 
                        onClick={handleDownloadFile} 
                        className="w-10 h-10 rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--hover-bg)] hover:border-purple-500 transition-all hover:scale-110 text-[var(--text-primary)]"
                        title="Download file"
                      >
                        <PiExportBold />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleNewTab} 
                        className="w-10 h-10 rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--hover-bg)] hover:border-purple-500 transition-all hover:scale-110 text-[var(--text-primary)]"
                        title="Open in fullscreen"
                      >
                        <ImNewTab />
                      </button>
                      <button 
                        onClick={handleRefresh} 
                        className="w-10 h-10 rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--hover-bg)] hover:border-purple-500 transition-all hover:scale-110 text-[var(--text-primary)]"
                        title="Refresh preview"
                      >
                        <FiRefreshCcw />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="h-full">
                {tab === 1 ? (
                  <React.Suspense fallback={<LoadingSpinner message="Loading editor..." />}>
                    <Editor 
                      value={code} 
                      height="100%" 
                      theme={isDark ? 'vs-dark' : 'vs-light'} 
                      language="html"
                      options={{
                        readOnly: false,
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true
                      }}
                    />
                  </React.Suspense>
                ) : (
                  <iframe 
                    key={refreshKey} 
                    srcDoc={code} 
                    className="w-full h-full"
                    title="Component preview"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Overlay */}
      {isNewTabOpen && (
        <div className="fixed inset-0 bg-[var(--primary-bg)] w-screen h-screen overflow-auto z-50 animate-fadeIn">
          <div className="w-full h-[60px] flex items-center justify-between px-5 bg-[var(--secondary-bg)] border-b-2 border-[var(--border-color)]">
            <p className='font-bold text-[var(--text-primary)]'>Preview</p>
            <button 
              onClick={handleCloseNewTab} 
              className="w-10 h-10 rounded-xl border-2 border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--hover-bg)] hover:border-purple-500 transition-all hover:scale-110 text-[var(--text-primary)]"
              title="Close fullscreen"
            >
              <IoCloseSharp />
            </button>
          </div>
          <iframe 
            srcDoc={code} 
            className="w-full h-[calc(100vh-60px)]"
            title="Fullscreen component preview"
          />
        </div>
      )}
    </>
  )
}

export default React.memo(Home)
