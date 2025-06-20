// Client-side API functions
export async function fetchEquipment(search?: string) {
  const url = new URL("/api/equipment", window.location.origin)
  if (search) {
    url.searchParams.set("search", search)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error("Failed to fetch equipment")
  }
  return response.json()
}

export async function createEquipment(data: any) {
  const response = await fetch("/api/equipment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create equipment")
  }
  return response.json()
}

export async function fetchCustomers(search?: string) {
  const url = new URL("/api/customers", window.location.origin)
  if (search) {
    url.searchParams.set("search", search)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error("Failed to fetch customers")
  }
  return response.json()
}

export async function createCustomer(data: any) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create customer")
  }
  return response.json()
}

export async function fetchRentals(search?: string) {
  const url = new URL("/api/rentals", window.location.origin)
  if (search) {
    url.searchParams.set("search", search)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error("Failed to fetch rentals")
  }
  return response.json()
}

export async function createRental(data: any) {
  const response = await fetch("/api/rentals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create rental")
  }
  return response.json()
}

export async function fetchAnalytics() {
  const response = await fetch("/api/analytics")
  if (!response.ok) {
    throw new Error("Failed to fetch analytics")
  }
  return response.json()
}

export function generateQRCode(prefix = "QR"): string {
  return `${prefix}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

export async function generateNextRentalNumber(): Promise<string> {
  try {
    const rentals = await fetchRentals()
    const count = rentals.length + 1
    return `R${count.toString().padStart(3, "0")}`
  } catch (error) {
    console.error("Error generating rental number:", error)
    return `R${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  }
}
