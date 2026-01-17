/**
 * SplineDrone Component
 * 
 * Renders an interactive 3D drone using Spline.
 * Uses React.lazy to defer loading and avoid build-time resolution issues.
 */

import { Suspense, lazy, useState } from 'react';

const SPLINE_SCENE_URL_PUBLIC_URL = 'https://my.spline.design/realisticdroneanimated-l48QwaLDdkhQxIcdnJmtzhaN/';
const CODE_SCENE_URL = 'https://draft.spline.design/tbjz3P5HnzLtuBq2/scene.splinecode';
// Lazy load Spline to avoid build-time module resolution issues
const Spline = lazy(() => import('@splinetool/react-spline'));

export default function SplineDrone() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (splineApp: any) => {
        setIsLoading(false);

        // Match the theme background color (#111111)
        if (splineApp && typeof splineApp.setBackgroundColor === 'function') {
            splineApp.setBackgroundColor('#111111');
        }

        // Programmatic zoom adjustment (1.0 is default, decrease to zoom out)
        if (splineApp && typeof splineApp.setZoom === 'function') {
            splineApp.setZoom(0.8);
        }
    };

    return (
        <div className="w-full h-full relative ">
            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 
                          rounded-full animate-spin" />
                </div>
            )}

            {/* Spline 3D Scene with Suspense for lazy loading */}
            <Suspense fallback={null}>
                <Spline
                    className=''
                    scene={CODE_SCENE_URL}
                    onLoad={handleLoad}
                    onError={() => setHasError(true)}
                    style={{ width: '100%', height: '100%', background: 'transparent' }}
                />
            </Suspense>

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 z-10">
                    Failed to load 3D scene
                </div>
            )}
        </div>
    );
}
