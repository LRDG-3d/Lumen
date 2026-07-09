import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar.jsx'
import PageTransition from './components/PageTransition.jsx'

import Home from './pages/Home.jsx'
import Movies from './pages/Movies.jsx'
import Series from './pages/Series.jsx'
import Categories from './pages/Categories.jsx'
import Search from './pages/Search.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import SeriesDetails from './pages/SeriesDetails.jsx'
import WatchMovie from './pages/WatchMovie.jsx'
import WatchEpisode from './pages/WatchEpisode.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMovieForm from './pages/admin/AdminMovieForm.jsx'
import AdminSeriesForm from './pages/admin/AdminSeriesForm.jsx'
import AdminSeriesManage from './pages/admin/AdminSeriesManage.jsx'

export default function App() {
  const location = useLocation()
  const isPlayer = location.pathname.startsWith('/ver')

  return (
    <div className="app-root">
      {!isPlayer && <Sidebar />}
      <div className={isPlayer ? '' : 'app-main'}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/peliculas" element={<PageTransition><Movies /></PageTransition>} />
            <Route path="/series" element={<PageTransition><Series /></PageTransition>} />
            <Route path="/categorias" element={<PageTransition><Categories /></PageTransition>} />
            <Route path="/buscar" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/pelicula/:folder" element={<PageTransition><MovieDetails /></PageTransition>} />
            <Route path="/serie/:folder" element={<PageTransition><SeriesDetails /></PageTransition>} />
            <Route path="/ver/pelicula/:folder" element={<WatchMovie />} />
            <Route path="/ver/serie/:folder/:season/:episode" element={<WatchEpisode />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="peliculas/nueva" element={<AdminMovieForm mode="create" />} />
              <Route path="peliculas/:folder/editar" element={<AdminMovieForm mode="edit" />} />
              <Route path="series/nueva" element={<AdminSeriesForm mode="create" />} />
              <Route path="series/:folder/editar" element={<AdminSeriesForm mode="edit" />} />
              <Route path="series/:folder/gestionar" element={<AdminSeriesManage />} />
            </Route>

            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </div>

      <style>{`
        .app-root { display: flex; min-height: 100vh; }
        .app-main { flex: 1; min-width: 0; }
      `}</style>
    </div>
  )
}
