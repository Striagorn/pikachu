import { getPlans } from './actions'
import PlansPageClient from '@/components/PlansPageClient'

export default async function PlansPage() {
  const plans = await getPlans()

  return <PlansPageClient plans={plans} />
}
