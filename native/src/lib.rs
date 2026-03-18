use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SPHSolver {
    particles: Vec<Particle>,
    params: Params,
}

#[wasm_bindgen]
impl SPHSolver {
    pub fn new(gravity: f32, rest_density: f32, gas_constant: f32, viscosity: f32, smoothing_radius: f32) -> Self {
        SPHSolver {
            particles: Vec::new(),
            params: Params {
                gravity,
                rest_density,
                gas_constant,
                viscosity,
                smoothing_radius,
            },
        }
    }

    pub fn add_particle(&mut self, x: f32, y: f32, vx: f32, vy: f32, color: &str) {
        self.particles.push(Particle {
            pos: [x, y],
            vel: [vx, vy],
            color: color.to_string(),
            density: 0.0,
        });
    }

    pub fn update(&mut self, dt: f32) {
        // ... SPH Berechnungen in Rust
    }

    pub fn get_particles(&self) -> JsValue {
        // Konvertiere Partikel für JS
        serde_wasm_bindgen::to_value(&self.particles).unwrap()
    }
}