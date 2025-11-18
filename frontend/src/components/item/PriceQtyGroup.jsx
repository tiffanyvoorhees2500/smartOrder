import './PriceQtyGroup.css';

export default function PriceQtyGroup({
  selectName,
  price,
  discount = 0, // comes in as normalized % = 15 not .15
  quantity = 0,
  setQuantity,
  disabled = false,
  helpText,
  showZero = true,
}) {
  // calculate discounted prices
  const discountedPrice = price * (1 - (discount/100)); // Make decimal form
  const total = quantity * discountedPrice;

  // The quantity select box
  let quantitySpace = (
    <>
      {" "}
      <label htmlFor={selectName} aria-label="quantity" className="quantity">
        <select
          name={selectName}
          id={selectName}
          value={quantity}
          onChange={(e) => setQuantity && setQuantity(+e.target.value)}
          disabled={disabled}
        >
          {Array.from({ length: 100 }, (_, index) => {
            return <option key={index}>{index}</option>;
          })}
        </select>
      </label>
      <span>@</span>
    </>
  );

  // If showZero is false, hide the select box
  if (!showZero) quantitySpace = null;

  return (
    <div className={`priceQtyGroupContainer`}>
      {disabled && <div className='disabledOverlay'></div>}

      <div className='helpText'>
        <span>{helpText}</span>
        <div>
          {discount}% Off <span className='strike'>${price.toFixed(2)}</span>
        </div>
      </div>

      <div className='priceQtyGroup'>
        {quantitySpace}
        <div className='price'>
          <span>${discountedPrice.toFixed(2)}</span>
          <div className='divider-thick'></div>
          <span className='bold'>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
