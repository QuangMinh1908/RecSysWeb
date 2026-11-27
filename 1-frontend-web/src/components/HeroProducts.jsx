import { useState } from 'react'
import laptop from '../assets/hero-laptop.webp'
import headphones from '../assets/hero-headphones.webp'
import mouse from '../assets/hero-mouse.webp'

const products = [
  { name: 'laptop', image: laptop },
  { name: 'headphones', image: headphones },
  { name: 'mouse', image: mouse },
]

export default function HeroProducts() {
  const [settledImages, setSettledImages] = useState({})
  const ready = products.every(({ name }) => settledImages[name])

  return (
    <div className={`hero-visual${ready ? ' is-ready' : ''}`} aria-hidden="true">
      {products.map(({ name, image }) => {
        const settleImage = () => setSettledImages((images) => ({ ...images, [name]: true }))

        return (
          <img
            key={name}
            className={`hero-product hero-product-${name}`}
            src={image}
            alt=""
            decoding="async"
            fetchPriority={name === 'laptop' ? 'high' : 'auto'}
            onLoad={({ currentTarget }) => {
              currentTarget.decode().then(settleImage, settleImage)
            }}
            onError={settleImage}
          />
        )
      })}
    </div>
  )
}
