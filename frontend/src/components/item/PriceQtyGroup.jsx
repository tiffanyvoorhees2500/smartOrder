import './PriceQtyGroup.css';

export default function PriceQtyGroup({
  selectName,
  price,
  percentOff = 0,
  quantity = 0,
  disabled = false,
  setQuantity = () => {},
  helpText,
  showZero = true,
}) {
  const discountedPrice = price * (1 - percentOff / 100);
  // Line Total multiply price * quantity
  const total = quantity * discountedPrice;

  // The quantity select box
  let quantitySpace = (
    <>
      {" "}
      <label htmlFor={selectName} aria-label="quantity" className="quantity">
        <select
          name={selectName}
          id={selectName}
          defaultValue={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
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

  // If showZero is false and the quantity is 0, hide the select box
  if (!showZero && quantity === 0) quantitySpace = null;

  return (
    <div className={`priceQtyGroupContainer`}>
      {disabled && <div className='disabledOverlay'></div>}

      <div className='helpText'>
        <span>{helpText}</span>
        <div>
          {percentOff}% Off <span className='strike'>${price.toFixed(2)}</span>
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
