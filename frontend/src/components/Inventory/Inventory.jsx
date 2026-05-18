import styles from "./Inventory.module.css";

function Inventory() {
    return (
        <>
            <div className={ `${styles.container} `  }>
                <div className={styles.topSection}>
                    <h2>Ingredients Inventory</h2>
                    <button className={styles.newBtn}>+ New Ingredient</button>
                </div>
                <div className={styles.topCards}>
                    <div className={styles.statsCard}>
                        <p className={styles.title}>TOTAL ITEMS</p>
                        <p className={styles.brown}>142</p>
                    </div>
                    <div className={styles.statsCard}>
                        <p className={styles.title}>LOW STOCK</p>
                        <p className={styles.red}>12</p>
                    </div>
                    <div className={styles.statsCard}>
                        <p className={styles.title}>OUT OF STOCK</p>
                        <p className={styles.red}>03</p>
                    </div>
                    <div className={styles.statsCard}>
                        <p className={styles.title}>PURCHASE VALUE</p>
                        <p className={styles.green}>$1,240</p>
                    </div>
                </div>
                <div className={styles.searchSection}>
                     <div className={`${styles.formOutline} data-mdb-input-init`}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="search" id="form1" className={styles.formControl} placeholder="Search ingredients (tomatoes, meat, flour ...)" aria-label="Search" />
                    </div>
                    <div className={styles.leftPart}>
                        <button className={styles.filter}>
                        <i class="fa-solid fa-sliders"></i>
                        <span>Filters</span>
                    </button>
                    <button className={styles.lowStock}>Low Stock Only</button>
                    </div>
                </div>









<div className="">


               <div className={`${styles.productCards} col-lg-4  col-md-3 `}>
                    <div className={`${styles.productCards}   ` }>
    
                     <div className={`${styles.item}  ${styles.lowStockBorder}`}>


                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>Roma Tomatoes</h3>
                                    <p>Vegetables & Produce</p>
                                </div>
                                <div className={styles.statusBadge}>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <span>Low Stock</span>
                                </div>
                            </div>




                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>4.2</span> kg</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>10.0 kg</p>
                                </div>
                            </div>




                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>
                       
                              <div className={`${styles.item}  ${styles.border}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>All-Purpose Flour</h3>
                                    <p>Dry Goods</p>
                                </div>
                            </div>
                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>45.0</span> kg</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>15.0 kg</p>
                                </div>
                            </div>
                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>
                        
                              <div className={`${styles.item} ${styles.border}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>Premium Ribeye</h3>
                                    <p>Proteins</p>
                                </div>
                                <div className={styles.healthy}>
                                    <i className="fa-regular fa-circle-check"></i>
                                    <span>Healthy</span>
                                </div>
                            </div>

                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>18.5</span> kg</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>8.0 kg</p>
                                </div>
                            </div>

                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>

</div>
</div>



</div>



 


                        



<div className={`${styles.productCards} col-lg-4 col-md-3`}>
                   







 <div className={`${styles.item} ${styles.lowStockBorder}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>Roma Tomatoes</h3>
                                    <p>Vegetables & Produce</p>
                                </div>
                                <div className={styles.statusBadge}>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <span>Low Stock</span>
                                </div>
                            </div>




                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>4.2</span> kg</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>10.0 kg</p>
                                </div>
                            </div>




                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>














                              {/* <div className={`${styles.item} ${styles.lowStockBorder}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={`${styles.itemTitle}` }>
                                    <h3>Whole Milk</h3>
                                    <p>Dairy</p>
                                </div>
                                <div className={ `${styles.statusBadge}` }>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <span>Low Stock</span>
                                </div>
                            </div>

                            <div className={`${styles.middleSection}` }>
                                <div className={`${styles.stockCol}` }>
                                    <p className={`${styles.label}` }>CURRENT STOCK</p>
                                    <p className={`${styles.value}` }><span>2.0</span> L</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>12.0 L</p>
                                </div>
                            </div>




                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div> */}
                        
                              <div className={`${styles.item} ${styles.border}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>Buffalo Mozzarella</h3>
                                    <p>Dairy</p>
                                </div>
                            </div>

                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>12.0</span> kg</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>5.0 kg</p>
                                </div>
                            </div>

                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>
                        
                              <div className={`${styles.item} ${styles.border}`}> 
                            <div className={styles.cardHeader}>
                                <div className={styles.imgPlaceholder}>
                                    <i className="fa-solid fa-image"></i> 
                                </div>
                                <div className={styles.itemTitle}>
                                    <h3>Extra Virgin Olive Oil</h3>
                                    <p>Oils and Vinegars</p>
                                </div>
                            </div>

                            <div className={styles.middleSection}>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>CURRENT STOCK</p>
                                    <p className={styles.value}><span>24.0</span> L</p>
                                </div>
                                <div className={styles.stockCol}>
                                    <p className={styles.label}>THRESHOLD</p>
                                    <p className={styles.value}>10.0 L</p>
                                </div>
                            </div>

                            <div className={styles.bottomActions}>
                                <button className={styles.editBtn}>Edit</button>
                                <button className={styles.restockBtn}>Restock</button>
                            </div>
                        </div>
                    </div>
                </div>
            
            
        </>
    );
}

export default Inventory;