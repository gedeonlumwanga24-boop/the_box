import { cartStore, useCartItems } from "../cart-store";

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} CDF`;

type CartPageProps = {
  onBackToCatalog: () => void;
};

export function CartPage({ onBackToCatalog }: CartPageProps) {
  const items = useCartItems();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-1">MON PANIER</h1>
        <p className="text-gray-500">
          {items.length > 0
            ? `${items.length} ${items.length > 1 ? "produits" : "produit"}`
            : "0 produits"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
          <p className="text-lg text-gray-600 mb-6">Le panier est vide</p>
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-block rounded-lg bg-black px-8 py-3 text-white font-semibold hover:bg-gray-900"
          >
            C'est parti
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex gap-4 border-b border-gray-200 pb-6"
              >
                <img
                  src={item.image || fallbackImage}
                  alt={item.name}
                  className="h-24 w-24 object-cover rounded"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {(item.size || item.color) && (
                    <p className="text-sm text-gray-500">
                      {[item.size, item.color].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        cartStore.setQuantity(item.key, item.quantity - 1)
                      }
                      className="h-8 w-8 border flex items-center justify-center hover:bg-gray-100"
                      aria-label="Diminuer la quantité"
                    >
                      −
                    </button>

                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        cartStore.setQuantity(item.key, item.quantity + 1)
                      }
                      className="h-8 w-8 border flex items-center justify-center hover:bg-gray-100"
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  <button
                    type="button"
                    onClick={() => cartStore.removeItem(item.key)}
                    className="text-sm text-gray-500 hover:text-red-600 mt-2 block"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Résumé</h2>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">Gratuite</span>
                </div>
              </div>

              <div className="border-t pt-4 text-lg font-bold flex justify-between">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">Livraison</h2>
              <p className="text-sm text-gray-600 mb-4">
                Veuillez vous connecter pour renseigner vos informations de
                livraison et passer commande.
              </p>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="inline-block w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-900"
              >
                Se connecter
              </a>
            </div>

            <button
              type="button"
              onClick={() => cartStore.clear()}
              className="block text-center text-sm text-gray-600 hover:text-gray-900 mt-4 underline w-full"
            >
              Vider le panier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
