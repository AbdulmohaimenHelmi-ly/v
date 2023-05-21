// import { LandingPage } from "./pages/LandingPage"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import React, { Suspense } from "react"
import { ConfigProvider, theme } from "antd"
import _404 from "./pages/404"
import ResetPassword from "./pages/ResetPassword."
import { UserProfile } from "./pages/UserProfile"
import { store } from "./redux/store"
import { Provider } from "react-redux"

function App() {
  const LandingPage = React.lazy(() => import("./pages/LandingPage"))
  const Login = React.lazy(() => import("./pages/Login"))
  const Signup = React.lazy(() => import("./pages/Signup"))
  return (
    <div className="app">
      <Provider store={store}>
        <ConfigProvider
          theme={{
            algorithm: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
          }}
        >
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div>loading...</div>}>
                    <LandingPage />
                  </Suspense>
                }
              />
              <Route
                path="/login"
                element={
                  <Suspense fallback={<div>loading...</div>}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/signup"
                element={
                  <Suspense fallback={<div>loading...</div>}>
                    <Signup />
                  </Suspense>
                }
              />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="*" element={<_404 />} />
            </Routes>
          </Router>
        </ConfigProvider>
      </Provider>
    </div>
  )
}

export default App
